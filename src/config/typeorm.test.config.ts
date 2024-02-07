import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeormtestConfig : TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '532621',
    database: 'groupcall_test',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    logging: true,
    synchronize: true
}