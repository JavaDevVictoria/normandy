import { Alert } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
  REVISION_DRAFT,
  REVISION_OUTDATED,
} from 'control_new/state/constants';
import {
  getRevisionDraftStatus,
} from 'control_new/state/revisions/selectors';


@connect(
  (state, { revision }) => ({
    enabled: revision.getIn(['recipe', 'enabled'], false),
    status: getRevisionDraftStatus(state, revision.get('id')),
  }),
)
export default class RevisionNotice extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    status: PropTypes.string,
  };

  static defaultProps = {
    status: null,
  }

  render() {
    const { enabled, status } = this.props;

    let message;
    let type;

    if (status === REVISION_DRAFT) {
      message = 'You are viewing a draft.';
      type = 'warning';
    } else if (status === REVISION_OUTDATED) {
      message = 'You are viewing an outdated version.';
      type = 'warning';
    } else if (enabled) {
      message = 'This is the published version.';
      type = 'success';
    } else {
      return null;
    }

    return (
      <Alert
        className="revision-notice"
        type={type}
        message={message}
        showIcon
      />
    );
  }
}
