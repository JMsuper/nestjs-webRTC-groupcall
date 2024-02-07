import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from "../../src/app.module";
import { CreateUserDto, LoginDto, PasswordUpdateUserDto } from "../../src/user/user.dto";
import * as cookieParser from 'cookie-parser';
import { HttpStatus } from "@nestjs/common";
import { User } from "../../src/user/user.entity";
import { UserRepository } from "../../src/user/user.repository";
import { DataSource } from "typeorm";
import { AuthService } from "../../src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";


describe('AuthController (e2e)', () => {
    let app;
    let userRepository: UserRepository;
    let dataSource: DataSource;
    let authService: AuthService;
    let jwtService: JwtService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        dataSource = module.get<DataSource>(DataSource);
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);

        app = module.createNestApplication();
        app.use(cookieParser());
        await app.init();
    });

    beforeEach(async () => {
        await userRepository.clear();

        var dto: CreateUserDto = new CreateUserDto();
        dto.email = "abc@gmail.com";
        dto.password = "12341234@@";
        dto.name = "testName";

        await userRepository.save({
            email: dto.email,
            password: await authService.encryptPassword(dto.password),
            name: dto.name
        });
    })

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });



    describe("POST /auth/register", () => {

        it("SUCCESS", async () => {
            //given
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "123@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(dto)
            
            //then
            expect(response.status).toEqual(HttpStatus.CREATED);

            const user: User = await userRepository.findOneBy({email: dto.email});
            expect(user.name).toEqual(dto.name);
            expect(user.password).not.toEqual(dto.password);
        });

        it("FAIL: duplicated email", async () => {
            //given
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "abc@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(dto)
            
            //then
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
            
            const count = await userRepository.countBy({email: dto.email});
            expect(count).toEqual(1);
        });
    });

    describe("POST /auth/login", () => {

        it("SUCCESS", async () => {
            //given
            var dto: LoginDto = new LoginDto();
            dto.email = "abc@gmail.com";
            dto.password = "12341234@@";

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: dto.email, password: dto.password});

            //then
            expect(response.status).toEqual(HttpStatus.OK);
            expect(response.headers['authorization']).toBeTruthy();
        });

        it("FAIL: password not correct", async () => {
            //given
            var dto: LoginDto = new LoginDto();
            dto.email = "abc@gmail.com";
            dto.password = "1234";

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: dto.email, password: dto.password});

            //then
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
            expect(response.headers['authorization']).not.toBeTruthy();
        });

        it("FAIL: not exist email", async () => {
            //given
            var dto: LoginDto = new LoginDto();
            dto.email = "abcabc@gmail.com";
            dto.password = "12341234@@";

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: dto.email, password: dto.password});

            //then
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
            expect(response.headers['authorization']).not.toBeTruthy();
        });
    });

    describe("Patch /auth/password", () => {

        it("SUCCESS", async () => {
            //given
            var dto: PasswordUpdateUserDto = new PasswordUpdateUserDto();
            dto.email = "abc@gmail.com";
            dto.password = "12341234@@";
            dto.newPassword = "12341234!!"

            const token = await jwtService.signAsync({userId: 1, email: dto.email}, {expiresIn: '30m'});

            //when
            const response = await request(app.getHttpServer())
            .patch('/auth/password')
            .set('authorization',"Bearer "+ token )
            .send(dto);

            //then
            expect(response.status).toEqual(HttpStatus.CREATED);
            
            const user = await userRepository.findOneBy({email: dto.email});
            expect(authService.verifyPassword(user, dto.newPassword)).resolves.toBeUndefined();
        });

        it("FAIL: not have access token", async () => {
            //given
            var dto: PasswordUpdateUserDto = new PasswordUpdateUserDto();
            dto.email = "abc@gmail.com";
            dto.password = "12341234@@";
            dto.newPassword = "12341234!!"
            
            //when
            const response = await request(app.getHttpServer())
            .patch('/auth/password')
            .send(dto);

            //then
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        });

    });

})