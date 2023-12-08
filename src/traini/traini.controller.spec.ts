import { Test, TestingModule } from '@nestjs/testing';
import { TrainiController } from './traini.controller';

describe('TrainiController', () => {
  let controller: TrainiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainiController],
    }).compile();

    controller = module.get<TrainiController>(TrainiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
