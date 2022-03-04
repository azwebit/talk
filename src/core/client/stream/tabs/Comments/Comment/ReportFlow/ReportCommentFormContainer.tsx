import { Localized } from "@fluent/react/compat";
import { FORM_ERROR } from "final-form";
import React, { FunctionComponent, useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";

import { ERROR_CODES } from "coral-common/errors";
import { InvalidRequestError } from "coral-framework/lib/errors";
import { useFetch, useMutation } from "coral-framework/lib/relay";
import WarningError from "coral-stream/common/WarningError";
import { Icon } from "coral-ui/components/v2";
import { CallOut } from "coral-ui/components/v3";

import { ReportCommentFormContainer_comment$key as ReportCommentFormContainer_comment } from "coral-stream/__generated__/ReportCommentFormContainer_comment.graphql";
import { ReportCommentFormContainer_settings$key as ReportCommentFormContainer_settings } from "coral-stream/__generated__/ReportCommentFormContainer_settings.graphql";

import { shouldTriggerViewerRefresh } from "../../helpers";
import RefreshViewerFetch from "../../RefreshViewerFetch";
import CreateCommentDisagreeMutation from "./CreateCommentDisagreeMutation";
import CreateCommentFlagMutation from "./CreateCommentFlagMutation";
import ReportCommentForm from "./ReportCommentForm";

interface Props {
  comment: ReportCommentFormContainer_comment;
  settings: ReportCommentFormContainer_settings;
  onClose: () => void;
}

const ReportCommentFormContainer: FunctionComponent<Props> = ({
  comment,
  settings,
  onClose,
}) => {
  const commentData = useFragment(
    graphql`
      fragment ReportCommentFormContainer_comment on Comment {
        id
        revision {
          id
        }
      }
    `,
    comment
  );
  const settingsData = useFragment(
    graphql`
      fragment ReportCommentFormContainer_settings on Settings {
        memberBios
      }
    `,
    settings
  );

  const [done, setDone] = useState(false);
  const dontAgreeMutation = useMutation(CreateCommentDisagreeMutation);
  const flagMutation = useMutation(CreateCommentFlagMutation);
  const refreshViewer = useFetch(RefreshViewerFetch);
  const onSubmit = useCallback(
    async (input) => {
      try {
        if (input.reason === "DISAGREE") {
          await dontAgreeMutation({
            commentID: commentData.id,
            // revision is guaranteed since we are able to interact with it
            commentRevisionID: commentData.revision!.id,
            additionalDetails: input.additionalDetails,
          });
        } else {
          await flagMutation({
            commentID: commentData.id,
            // revision is guaranteed since we are able to interact with it
            commentRevisionID: commentData.revision!.id,
            reason: input.reason,
            additionalDetails: input.additionalDetails,
          });
        }
        setDone(true);
      } catch (err) {
        if (err instanceof InvalidRequestError) {
          if (shouldTriggerViewerRefresh(err.code)) {
            await refreshViewer();
          }

          if (err.code === ERROR_CODES.USER_WARNED) {
            return {
              [FORM_ERROR]: <WarningError />,
            };
          }

          return err.invalidArgs;
        }
        // eslint-disable-next-line no-console
        console.error(err);
      }

      return undefined;
    },
    [
      commentData.id,
      commentData.revision,
      dontAgreeMutation,
      flagMutation,
      refreshViewer,
    ]
  );

  if (!done) {
    return (
      <ReportCommentForm
        id={commentData.id}
        data-testid="report-comment-form"
        onSubmit={onSubmit}
        onCancel={onClose}
        biosEnabled={settingsData.memberBios}
      />
    );
  }

  return (
    <CallOut
      color="success"
      title={
        <Localized id="comments-reportPopover-thankYou">Thank you!</Localized>
      }
      onClose={onClose}
      icon={<Icon size="sm">check_circle</Icon>}
      aria-live="polite"
    >
      <Localized id="comments-reportPopover-receivedMessage">
        We’ve received your message. Reports from members like you keep the
        community safe.
      </Localized>
    </CallOut>
  );
};

export default ReportCommentFormContainer;
