const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let issueId; // To store the ID of a created issue for further tests

  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Tester',
        assigned_to: 'Developer',
        status_text: 'In Progress',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.propertyVal(res.body, 'issue_title', 'Test Issue');
        assert.propertyVal(res.body, 'issue_text', 'This is a test issue');
        assert.propertyVal(res.body, 'created_by', 'Tester');
        assert.propertyVal(res.body, 'assigned_to', 'Developer');
        assert.propertyVal(res.body, 'status_text', 'In Progress');
        issueId = res.body._id; // Store the created issue ID
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue 2',
        issue_text: 'This is another test issue',
        created_by: 'Tester 2',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.propertyVal(res.body, 'issue_title', 'Test Issue 2');
        assert.propertyVal(res.body, 'issue_text', 'This is another test issue');
        assert.propertyVal(res.body, 'created_by', 'Tester 2');
        assert.propertyVal(res.body, 'assigned_to', '');
        assert.propertyVal(res.body, 'status_text', '');
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        assigned_to: 'Dev',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({ issue_title: 'Test Issue' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.propertyVal(issue, 'issue_title', 'Test Issue');
        });
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({ issue_title: 'Test Issue', created_by: 'Tester' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.propertyVal(issue, 'issue_title', 'Test Issue');
          assert.propertyVal(issue, 'created_by', 'Tester');
        });
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ _id: issueId, issue_title: 'Updated Issue' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully updated');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        _id: issueId,
        issue_title: 'Updated Issue Again',
        issue_text: 'This is updated issue text',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully updated');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ issue_title: 'Another Update' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'no update field(s) sent');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalidid', issue_title: 'Invalid Update' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'could not update');
        assert.propertyVal(res.body, '_id', 'invalidid');
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully deleted');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidid' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'could not delete');
        assert.propertyVal(res.body, '_id', 'invalidid');
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'missing _id');
        done();
      });
  });
});