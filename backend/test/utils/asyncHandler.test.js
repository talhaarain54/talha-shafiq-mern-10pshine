import { expect } from 'chai';
import sinon from 'sinon';
import asyncHandler from '../../src/utils/asyncHandler.js';

describe('asyncHandler utility', () => {
  it('should call the wrapped function with req, res, next', async () => {
    const fn = sinon.stub().resolves();
    const wrapped = asyncHandler(fn);
    const req = {}, res = {}, next = sinon.spy();

    await wrapped(req, res, next);

    expect(fn.calledOnceWith(req, res, next)).to.be.true;
  });

  it('should call next(err) when the wrapped function throws', async () => {
    const error = new Error('Test error');
    const fn = sinon.stub().rejects(error);
    const wrapped = asyncHandler(fn);
    const req = {}, res = {}, next = sinon.spy();

    await wrapped(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.equal(error);
  });

  it('should not call next if function resolves successfully', async () => {
    const fn = sinon.stub().resolves('ok');
    const wrapped = asyncHandler(fn);
    const req = {}, res = {}, next = sinon.spy();

    await wrapped(req, res, next);

    expect(next.called).to.be.false;
  });
});