import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent, useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";

import { useMutation } from "coral-framework/lib/relay";
import { GQLFEATURE_FLAG, GQLSTORY_MODE } from "coral-framework/schema";
import { HorizontalRule, Icon } from "coral-ui/components/v2";
import { CallOut } from "coral-ui/components/v3";

import { QAConfigContainer_settings$key as QAConfigContainer_settings } from "coral-stream/__generated__/QAConfigContainer_settings.graphql";
import { QAConfigContainer_story$key as QAConfigContainer_story } from "coral-stream/__generated__/QAConfigContainer_story.graphql";

import DisableQA from "./DisableQA";
import EnableQA from "./EnableQA";
import UpdateStoryModeMutation from "./UpdateStoryModeMutation";

import styles from "./QAConfigContainer.css";

interface Props {
  story: QAConfigContainer_story;
  settings: QAConfigContainer_settings;
}

const QAConfigContainer: FunctionComponent<Props> = ({ story, settings }) => {
  const storyData = useFragment(
    graphql`
      fragment QAConfigContainer_story on Story {
        id
        settings {
          mode
        }
      }
    `,
    story
  );
  const settingsData = useFragment(
    graphql`
      fragment QAConfigContainer_settings on Settings {
        featureFlags
      }
    `,
    settings
  );

  const [waiting, setWaiting] = useState(false);
  const updateStoryMode = useMutation(UpdateStoryModeMutation);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOnClick = useCallback(async () => {
    if (!waiting) {
      setWaiting(true);
      if (storyData.settings.mode === GQLSTORY_MODE.COMMENTS) {
        await updateStoryMode({
          storyID: storyData.id,
          mode: GQLSTORY_MODE.QA,
        });
      } else {
        await updateStoryMode({
          storyID: storyData.id,
          mode: GQLSTORY_MODE.COMMENTS,
        });
      }
      setWaiting(false);
      setShowSuccess(true);
    }
  }, [waiting, setWaiting, storyData, updateStoryMode, setShowSuccess]);
  const closeSuccess = useCallback(() => {
    setShowSuccess(false);
  }, [setShowSuccess]);

  const isQA = storyData.settings.mode === GQLSTORY_MODE.QA;

  // Check if we're allowed to show Q&A based on feature flags
  if (!settingsData.featureFlags.includes(GQLFEATURE_FLAG.ENABLE_QA)) {
    return null;
  }

  return isQA ? (
    <section aria-labelledby="configure-disableQA-title">
      <HorizontalRule />
      <DisableQA
        storyID={storyData.id}
        onClick={handleOnClick}
        disableButton={waiting}
      />
      <div
        className={showSuccess ? styles.calloutVisible : styles.calloutHidden}
      >
        {showSuccess && (
          <CallOut
            color="success"
            icon={<Icon size="sm">check_circle</Icon>}
            titleWeight="semiBold"
            title={
              <Localized id="configure-disableQA-streamIsNowQA">
                <span>This stream is now in Q&A format</span>
              </Localized>
            }
            onClose={closeSuccess}
            visible={showSuccess}
            aria-live="polite"
          />
        )}
      </div>
    </section>
  ) : (
    <section aria-labelledby="configure-enableQA-title">
      <HorizontalRule />
      <EnableQA onClick={handleOnClick} disableButton={waiting} />
      <div
        className={showSuccess ? styles.calloutVisible : styles.calloutHidden}
      >
        {showSuccess && (
          <CallOut
            color="success"
            icon={<Icon size="sm">check_circle</Icon>}
            titleWeight="semiBold"
            title={
              <Localized id="configure-enableQA-streamIsNowComments">
                <span>This stream is now in comments format</span>
              </Localized>
            }
            onClose={closeSuccess}
            visible={showSuccess}
            aria-live="polite"
          />
        )}
      </div>
    </section>
  );
};

export default QAConfigContainer;
