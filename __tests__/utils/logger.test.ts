import { createLogger, logger } from '../../utils/logger';

describe('logger', () => {
  describe('createLogger', () => {
    it('returns an object with error and warn methods', () => {
      const log = createLogger('[Test]');
      expect(typeof log.error).toBe('function');
      expect(typeof log.warn).toBe('function');
    });
  });

  describe('error', () => {
    it('calls console.error with prefixed message', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const log = createLogger('[Test]');

      log.error('something broke', { detail: 42 });

      expect(errorSpy).toHaveBeenCalledWith(
        '[Test] something broke',
        { detail: 42 }
      );

      errorSpy.mockRestore();
    });

    it('works without extra args', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const log = createLogger('[Test]');

      log.error('simple message');

      expect(errorSpy).toHaveBeenCalledWith('[Test] simple message');

      errorSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('calls console.warn with prefixed message in test environment', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const log = createLogger('[Test]');

      log.warn('heads up', 'extra');

      expect(warnSpy).toHaveBeenCalledWith('[Test] heads up', 'extra');

      warnSpy.mockRestore();
    });

    it('works without extra args', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const log = createLogger('[Test]');

      log.warn('simple warning');

      expect(warnSpy).toHaveBeenCalledWith('[Test] simple warning');

      warnSpy.mockRestore();
    });
  });

  describe('default logger', () => {
    it('uses [BPFViewer] prefix', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('test message');

      expect(errorSpy).toHaveBeenCalledWith('[BPFViewer] test message');

      errorSpy.mockRestore();
    });
  });

  describe('different prefixes', () => {
    it('each logger uses its own prefix', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const logA = createLogger('[ServiceA]');
      const logB = createLogger('[ServiceB]');

      logA.error('error from A');
      logB.error('error from B');

      expect(errorSpy).toHaveBeenCalledWith('[ServiceA] error from A');
      expect(errorSpy).toHaveBeenCalledWith('[ServiceB] error from B');

      errorSpy.mockRestore();
    });
  });
});
