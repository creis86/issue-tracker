import React from 'react';
import { Route } from 'react-router-dom';
import URLSearchParams from 'url-search-params';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueAdd from './IssueAdd.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {
      issues: [],
    };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) this.loadData();
  }

  async loadData() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    const vars = {};
    if (params.get('status')) vars.status = params.get('status');
    const query = `query issueList($status: StatusType) {
                    issueList(status: $status) {
                      id
                      status
                      owner
                      effort
                      created
                      due
                      title
                    }
                  }`;
    const data = await graphQLFetch(query, vars);
    if (data) this.setState({ issues: data.issueList });
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
                    issueAdd(issue: $issue) {
                      id
                    }
                  }`;
    const data = await graphQLFetch(query, { issue });
    if (data) this.loadData();
  }

  render() {
    const { issues } = this.state;
    const { match } = this.props;
    return (
      <>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
        <hr />
        <Route path={`${match.path}/:id`} component={IssueDetail} />
      </>
    );
  }
}
