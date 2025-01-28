'use strict';

module.exports = function (app) {
  let issues = [];

  function idClosure() {
    let count = 0;
    return () => (++count).toString();
  }

  const getId = idClosure();
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let { project } = req.params;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on,
        updated_on,
        open,
      } = req.query;

      const projectIssues = issues.filter(issue => issue.project === project)
      
      const filteredIssues = projectIssues.filter(issue => {
        return (
          (!_id || issue._id === _id) &&
          (!issue_title || issue.issue_title === issue_title) &&
          (!issue_text || issue.issue_text.includes(issue_text)) &&
          (!created_by || issue.created_by === created_by) &&
          (!assigned_to || issue.assigned_to === assigned_to) &&
          (!status_text || issue.status_text === status_text) &&
          (!created_on || issue.created_on === created_on) &&
          (!updated_on || issue.updated_on === updated_on) &&
          (open === undefined || issue.open === (open === 'true'))
        );
      });

      res.json(filteredIssues);
    })
    
    .post(function (req, res){
      let { project } = req.params;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      if (!issue_title || !issue_text || !created_by) return res.json({
        error: "required field(s) missing"
      })

      const newIssue = {
        _id: getId(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true,
        project,
      };

      issues.push(newIssue);
      console.log(issues);
      
      return res.json(newIssue);
    })
    
    .put(function (req, res){
      let { project } = req.params;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if(!_id) return res.json({
        error: "missing _id"
      })

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        return res.json({
          error: "no update field(s) sent",
          _id,
        });
      }
    
      const issue = issues.find(issue => issue._id === _id);

      if (!issue) return res.json({
        error: "could not update",
        _id
      })

      if (issue_title) issue.issue_title = issue_title;
      if (issue_text) issue.issue_text = issue_text;
      if (created_by) issue.created_by = created_by;
      if (assigned_to) issue.assigned_to = assigned_to;
      if (status_text) issue.status_text = status_text;
      if (open) issue.open = false;

      issue.updated_on = new Date().toISOString();

      return res.json({
        result: "successfully updated",
        _id
      })
    })
    
    .delete(function (req, res){
      let { project } = req.params;
      const { _id } = req.body;

      if(!_id) return res.json({
        error: "missing _id"
      })

      const index = issues.findIndex(issue => issue._id === _id);

      if (index === -1) return res.json({
        error: "could not delete",
        _id,
      })

      issues.splice(index, 1)

      return res.json({
        result: "successfully deleted",
        _id,
      });
    });
    
};
