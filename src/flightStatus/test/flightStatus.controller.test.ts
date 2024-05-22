import chai from 'chai';
import sinon from 'sinon';
import mongoSetup from "./mongoSetup";
import chaiHttp from "chai-http";
import express from "express";
import router from "src/flightStatus/flightStatus.router";
import bodyParser from 'body-parser';
import * as flightServiceClient from "src/clients/flightsServiceClient";

const {expect} = chai;
chai.use(chaiHttp);
chai.should();

const sandbox = sinon.createSandbox();

const app = express();

app.use(bodyParser.json({limit: '1mb'}));
app.use('/', router);

describe('FlightStatusController', () => {
  before(async () => {
    await mongoSetup;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should save flight status', (done) => {
    const clientCallStub = sandbox.stub(flightServiceClient, 'existsByFlightId');
    clientCallStub.resolves(true);
    chai.request(app)
      .post('')
      .send({
        flightId: '11',
        status: 'DELAYED',
      })
      .end((_, res) => {
        res.should.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.be.not.empty;
        done();
      });
  });

  it('should return 400 if flightId is not provided', (done) => {
    chai.request(app)
      .post('')
      .send({
        status: 'DELAYED',
      })
      .end((_, res) => {
        res.should.have.status(500);
        expect(res.body).to.have.property('message').eq('Flight id is required.');
        done();
      });
  });

  it('should return 400 if status is not provided', (done) => {
    chai.request(app)
      .post('')
      .send({
        flightId: '11',
      })
      .end((_, res) => {
        res.should.have.status(500);
        expect(res.body).to.have.property('message').eq('Status is invalid.');
        done();
      });
  });

  it('should return saved flight status', (done) => {
    chai.request(app)
      .get('/?flightId=11')
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body.flightStatuses[0]).to.have.property('flightId').eq('11');
        expect(res.body.flightStatuses[0]).to.have.property('status').eq('DELAYED');
        done();
      });
  });

  it('should return 400 if flightId is not provided', (done) => {
    chai.request(app)
      .get('/')
      .end((_, res) => {
        res.should.have.status(400);
        expect(res.body).to.have.property('message').eq('flightId is required');
        done();
      });
  });

  it('should return flight status counts', (done) => {
    chai.request(app)
      .post('/_counts')
      .send({
        flightIds: ['11', '12'],
      })
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body).to.have.property('11').eq(1);
        expect(res.body).to.have.property('12').eq(0);
        done();
      });
  });

  it('should return 400 if flightIds is not provided', (done) => {
    chai.request(app)
      .post('/_counts')
      .send({})
      .end((_, res) => {
        res.should.have.status(400);
        expect(res.body).to.have.property('message').eq('FlightIds must be a non-empty array');
        done();
      });
  });
});