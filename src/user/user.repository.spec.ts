import { UserRepository } from "./user.repository"
import { Test, TestingModule } from "@nestjs/testing";
import { UserModule } from "./user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { DataSource, LessThan, MoreThan, QueryFailedError } from "typeorm";
import { typeormConfig } from "../config/typeorm.config";

describe('UserRepository', () => {
    let userRepository : UserRepository;
    let dataSource : DataSource;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule,TypeOrmModule.forRoot(typeormConfig)] 
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        dataSource = module.get<DataSource>(DataSource);
    });

    beforeEach(async () => {
        await userRepository.delete({id: MoreThan(0)});
    });

    afterAll(async () => {
        await dataSource.destroy()
    })

    describe('save', ()=>{

        it('Given_UserHasNotID_When_Save_Then_InsertUser', async () => {
            // given
            const user = new User();
            user.email = "test@gmail.com";
            user.password = "1234";
            user.name = "testName";
            
            // when
            const savedUser = await userRepository.save(user);
    
            // then
            expect(savedUser.id).toBeGreaterThanOrEqual(1);
        });
    
        it('Given_UserHasID_When_Save_Then_UpdateUser', async () => {
            // given
            const user1 = new User();
            user1.email = "test@gmail.com";
            user1.password = "1234";
            user1.name = "testName";
    
            const savedUser = await userRepository.save(user1);
    
            savedUser.name = "updatedName";
            
            // when
            const updatedUser = await userRepository.save(savedUser);
    
            // then
            expect(updatedUser.id).toEqual(savedUser.id);
            expect(updatedUser.name).toEqual("updatedName");
        });
    
        it('Given_SameEmail_When_Save_Then_ThrowQueryFailedError', async () => {
            // given
            const user1 = new User();
            user1.email = "test@gmail.com";
            user1.password = "1234";
            user1.name = "testName";
    
            await userRepository.save(user1);
    
            const user2 = new User();
            user2.email = "test@gmail.com";
            user2.password = "1234";
            user2.name = "testName";
            
            // when
            // then
            expect( async () => userRepository.save(user2)).rejects.toThrow(QueryFailedError);
        });

    })

    describe('findOne', () => {

        it('Given_NotExistId_When_FindOne_Then_ReturnNull', async () => {
            // given
            const id = 10;
            
            // when
            const foundUser = await userRepository.findOne({where:{id}});
    
            // then
            expect(foundUser).toBeNull();
        });

    })

    describe('softRemove', ()=>{

        it('Given_User_When_SoftRemove_Then_DeleteColumn_Not_Null', async () => {
            // given
            const user = new User();
            user.email = "test@gmail.com";
            user.password = "1234";
            user.name = "testName";
    
            const savedUser = await userRepository.save(user);
            
            // when
            const removedUser = await userRepository.softRemove(savedUser);
    
            // then
            expect(removedUser.deletedAt).toBeInstanceOf(Date);
        });

    })

})