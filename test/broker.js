var Broker = require('../').Broker
var Spinal = require('../').Node
var _ = require('lodash')

describe('Broker', function() {
  var broker = new Broker()
  var spinal = undefined
  var spinalA = undefined
  var spinalB = undefined

  describe('Structure', function() {
    it('Should start broker with default port', function(done) {
      broker.start(function() {
        assert.equal(this.port, 7557)
        broker.stop(done)
      })
    })

    it('Should start broker with specific port', function(done) {
      broker.start(37557, function() {
        assert.equal(this.port, 37557)
        broker.stop(done)
      })
    })
  })

  describe('Connection', function() {
    it('After node start() Broker should knows a new node', function(done) {
      spinal = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinal.provide('foo', function(data, res){
        res.send(data)
      })

      broker.start(function() {
        spinal.start(function(){
          expect(_.keys(broker.router.routing)).eql(['foobar.foo'])
          spinal.stop(function(){
            broker.stop(done)
          })
        })

      })
      
    })

    it('After node stop() Broker should remove a node', function(done) {
      spinal = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinal.provide('foo', function(data, res){
        res.send(data)
      })

      broker.start(function() {
        spinal.start(function(){
          spinal.stop(function(){
            expect(broker.router.node).empty
            broker.stop(done)
          })
        })

      })


    })
  })

  describe('Nodes', function() {
    it('add multiple nodes with a single method and a single namespace', function(done) {

      spinalA = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinalB = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinalA.provide('foo', function(data, res){
        res.send(data)
      })

      spinalB.provide('foo', function(data, res){
        res.send(data)
      })

      broker.start(function() {
        spinalA.start(function(){
          spinalB.start(function(){
            expect(_.keys(broker.router.nodes)).have.to.length(2)
            expect(_.keys(broker.router.namespace)).have.to.length(1)
            expect(_.keys(broker.router.routing)).have.to.length(1)
            expect(broker.router.namespace).have.property('foobar')
            expect(_.keys(broker.router.routing)).eql(['foobar.foo'])

            spinalA.stop(function(){
              spinalB.stop(function(){
                broker.stop(done)
              })
            })
          })
        })


      })

    })



    it('add multiple nodes with multiple methods in a single namespace', function(done) {

      spinalA = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinalB = new Spinal('spinal://127.0.0.1:7557', {
        namespace: 'foobar', heartbeat_interval: 500
      })

      spinalA.provide('foo', function(data, res){
        res.send(data)
      })

      spinalB.provide('bar', function(data, res){
        res.send(data)
      })

      broker.start(function() {
        spinalA.start(function(){
          spinalB.start(function(){
            expect(_.keys(broker.router.nodes)).have.to.length(2)
            expect(_.keys(broker.router.namespace)).have.to.length(1)
            expect(_.keys(broker.router.routing)).have.to.length(2)
            expect(broker.router.namespace).have.property('foobar')
            expect(_.keys(broker.router.routing)).eql(['foobar.foo', 'foobar.bar'])
            spinalA.stop(function(){
              spinalB.stop(function(){
                broker.stop(done)  
              }) 
            })
          })
        })

      })

    })
    it.skip('loadbalance method between nodes', function(done) {})
  })

  it.skip('_ping service', function(done) {
    spinalA = new Spinal('spinal://127.0.0.1:7557', {
      namespace: 'foobar', heartbeat_interval: 500
    })
    assert.equal('pong', 'pong')
    done()
  })

  // it.skip('_handshake service', function(done) {
  //   assert.equal('pong', 'pong')
  //   done()
  // })

  // it.skip('_heartbeat service', function(done) {
  //   assert.equal('pong', 'pong')
  //   done()
  // })

})
