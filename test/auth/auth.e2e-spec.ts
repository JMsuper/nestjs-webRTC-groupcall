import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from "../../src/app.module";
import { CreateUserDto } from "../../src/user/user.dto";
import * as cookieParser from 'cookie-parser';
import { HttpStatus } from "@nestjs/common";
import { User } from "../../src/user/user.entity";
import { UserRepository } from "../../src/user/user.repository";
import { DataSource } from "typeorm";
import { AuthService } from "../../src/auth/auth.service";


describe('AuthController (e2e)', () => {
    let app;
    let userRepository: UserRepository;
    let dataSource: DataSource;
    let authService: AuthService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        dataSource = module.get<DataSource>(DataSource);
        authService = module.get<AuthService>(AuthService);

        app = module.createNestApplication();
        app.use(cookieParser());
        await app.init();
    });

    beforeEach(async () => {
        await userRepository.clear();
    })

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });



    describe("POST /auth/register", () => {

        it("SUCCESS", async () => {
            //given
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "email@gmail.com";
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
            dto.email = "email@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";
            await userRepository.save({email: dto.email, password: dto.password, name: dto.name});

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
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "email@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";

            await userRepository.save({
                email: dto.email,
                password: await authService.encryptPassword(dto.password),
                name: dto.name
            });

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
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "email@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";

            await userRepository.save({
                email: dto.email,
                password: await authService.encryptPassword(dto.password),
                name: dto.name
            });

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: dto.email, password: "1234"});

            //then
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
            expect(response.headers['authorization']).not.toBeTruthy();
        });

        it("FAIL: not exist email", async () => {
            //given
            var dto: CreateUserDto = new CreateUserDto();
            dto.email = "email@gmail.com";
            dto.password = "12341234@@";
            dto.name = "testName";

            await userRepository.save({
                email: dto.email,
                password: await authService.encryptPassword(dto.password),
                name: dto.name
            });

            //when
            const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: "email@naver.com", password: dto.password});

            //then
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
            expect(response.headers['authorization']).not.toBeTruthy();
        });
    });

})