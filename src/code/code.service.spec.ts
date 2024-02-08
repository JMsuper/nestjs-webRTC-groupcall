import { Test, TestingModule } from '@nestjs/testing';
import { CodeService } from './code.service';
import { CodeRepository } from './code.repository';
import { Code } from './code.entity';

const mockRepository = {
  findOneBy : jest.fn(),
  save : jest.fn(),
}

describe('CodeService', () => {
  let codeService: CodeService;
  let codeRepository: CodeRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeService, {provide: CodeRepository, useValue: mockRepository}],
    }).compile();

    codeService = module.get<CodeService>(CodeService);
    codeRepository = module.get<CodeRepository>(CodeRepository);
  });

  describe('createUniqueStringCode', () => {

    it('SUCCESS', async () => {
      jest.spyOn(codeRepository, 'findOneBy').mockResolvedValue(null);
      const codeString = await codeService.createUniqueStringCode();

      expect(typeof codeString).toBe("string");
    });

  });

  describe('generateAlphaNumericCode', () => {

    it('SUCCESS', () => {
      const code = codeService.generateAlphaNumericCode();

      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(1);
    });

  });

  describe('isCodeDuplicated', () => {

    it('Given_NotDuplicated_When_Then_False', async () => {
      //given
      const codeString = "code";
      jest.spyOn(codeRepository,'findOneBy').mockResolvedValue(null);

      //when
      const result = await codeService.isCodeDuplicated(codeString);

      //then
      expect(result).toBeFalsy();
    });

    it('Given_Duplicated_When_Then_True', async () => {
      //given
      const codeString = "code";
      const code = new Code();
      jest.spyOn(codeRepository,'findOneBy').mockResolvedValue(code);

      //when
      const result = await codeService.isCodeDuplicated(codeString);

      //then
      expect(result).toBeTruthy();
    });

  });
});
