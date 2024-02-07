import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from "../../src/app.module";
import { CreateUserDto } from "../../src/user/user.dto";
import * as cookieParser from 'cookie-parser';
import { HttpStatus } from "@nestjs/common";
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

    var dto: CreateUserDto = new CreateUserDto();
    dto.email = "abc@gmail.com";
    dto.password = "12341234@@";
    dto.name = "testName";


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

    describe("GET /user/:userId", () => {

        it("SUCCESS", async () => {
            //given
            const userId = 1;
            const token = await jwtService.signAsync({userId: 1, email: dto.email}, {expiresIn: '30m'});

            //when
            const response: request.Response = await request(app.getHttpServer())
            .get(`/user/${userId}`)
            .set('authorization',"Bearer "+ token );
            
            //then
            const {id, email, name} = response.body;
            
            expect(response.status).toEqual(HttpStatus.OK);
            expect(id).toEqual(userId);
            expect(email).toEqual(dto.email);
        });

        it("FAIL: not exist user id", async () => {
            //given
            const userId = 2;
            const token = await jwtService.signAsync({userId: 1, email: dto.email}, {expiresIn: '30m'});

            //when
            const response: request.Response = await request(app.getHttpServer())
            .get(`/user/${userId}`)
            .set('authorization',"Bearer "+ token );
            
            //then
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });

})