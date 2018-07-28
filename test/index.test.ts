import chai from 'chai'
import 'mocha'
import sinon, { SinonSpy } from 'sinon'
import sinonChai from 'sinon-chai'
import {
  ItemDequeuedEventName,
  ItemQueuedEventName,
  NotifierQueue
} from '../src/index'

const expect = chai.expect
chai.use(sinonChai)

const TestItem = 'hello'

const setup = (
  values: string[] = []
): [NotifierQueue<string>, SinonSpy, SinonSpy] => {
  const sut = NotifierQueue.make<string>(values)
  const enqueueListener = sinon.spy()
  const dequeueListener = sinon.spy()

  sut.on(ItemQueuedEventName, enqueueListener)
  sut.on(ItemDequeuedEventName, dequeueListener)

  return [sut, enqueueListener, dequeueListener]
}

describe('Queue tests', () => {
  describe('Enqueueing an item', () => {
    const [sut, enqueueListener] = setup()

    before(() => sut.enqueue(TestItem))

    it('should not be empty', () => expect(sut.isEmpty).to.be.false)
    it('should have a length of 1', () => expect(sut).to.have.lengthOf(1))
    it('should emit an event', () =>
      expect(enqueueListener).to.have.been.calledOnceWithExactly(TestItem))
  })

  describe('Dequeing an item', () => {
    describe('from a queue with one item', () => {
      const [sut, , dequeueListener] = setup([TestItem])
      let dequeuedItem: string | undefined

      before(() => {
        dequeuedItem = sut.dequeue()
      })

      it('should be empty', () => expect(sut.isEmpty).to.be.true)
      it('should have a length of 0', () => expect(sut).to.have.lengthOf(0))
      it('should emit an event', () =>
        expect(dequeueListener).to.have.been.calledOnceWithExactly(TestItem))
      it('should return the dequeued item', () =>
        expect(dequeuedItem).to.equal(TestItem))
    })

    describe('from an empty queue', () => {
      const [sut, , dequeueListener] = setup()
      let dequeuedItem: string | undefined

      before(() => {
        dequeuedItem = sut.dequeue()
      })

      it('should be empty', () => expect(sut.isEmpty).to.be.true)
      it('should have a length of 0', () => expect(sut).to.have.lengthOf(0))
      it('should not emit an event', () =>
        expect(dequeueListener).to.not.have.been.called)
      it('should return undefined', () => expect(dequeuedItem).to.be.undefined)
    })
  })

  describe('checking if a queue contains an item', () => {
    const [sut] = setup([TestItem])

    it('should return true for checking the contained item', () =>
      expect(sut.contains(i => i === TestItem)).to.be.true)

    it('should return false for checking any other item', () =>
      expect(sut.contains(i => i === 'blurb')).to.be.false)
  })

  describe('Peeking the next item', () => {
    describe('of a non-empty queue', () => {
      const [sut, , dequeueListener] = setup([TestItem])
      let peekedItem: string | undefined

      before(() => {
        peekedItem = sut.peek()
      })

      it('should not be empty', () => expect(sut.isEmpty).to.be.false)
      it('should have a length of 1', () => expect(sut).to.have.lengthOf(1))
      it('should not emit an event', () =>
        expect(dequeueListener).to.not.have.been.called)
      it('should return the peeked item', () =>
        expect(peekedItem).to.equal(TestItem))
    })

    describe('of an empty queue', () => {
      const [sut, , dequeueListener] = setup()
      let peekedItem: string | undefined

      before(() => {
        peekedItem = sut.peek()
      })

      it('should be empty', () => expect(sut.isEmpty).to.be.true)
      it('should have a length of 0', () => expect(sut).to.have.lengthOf(0))
      it('should not emit an event', () =>
        expect(dequeueListener).to.not.have.been.called)
      it('should return undefined', () => expect(peekedItem).to.be.undefined)
    })
  })

  describe('Seeking an item', () => {
    const [sut, , dequeueListener] = setup(['bla', TestItem, 'blurb'])
    let processedItem: string | undefined

    before(() => {
      processedItem = sut.seek(
        i => (i === TestItem ? i.toUpperCase() : undefined)
      )
    })

    it('should not be empty', () => expect(sut.isEmpty).to.be.false)
    it('should have a length of 2', () => expect(sut).to.have.lengthOf(2))
    it('should emit an event', () =>
      expect(dequeueListener).to.have.been.calledOnceWithExactly(TestItem))
    it('should return the processed item', () =>
      expect(processedItem).to.be.equal(TestItem.toUpperCase()))
    it('should remove the processed item from the queue', () =>
      expect(sut.contains(i => i === TestItem)).to.be.false)
  })
})
