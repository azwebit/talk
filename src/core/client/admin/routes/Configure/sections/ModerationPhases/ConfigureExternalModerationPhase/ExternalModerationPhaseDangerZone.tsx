import { Localized } from "@fluent/react/compat";
import { useRouter } from "found";
import React, { FunctionComponent, useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";

import Subheader from "coral-admin/routes/Configure/Subheader";
import { urls } from "coral-framework/helpers";
import { useCoralContext } from "coral-framework/lib/bootstrap";
import { getMessage } from "coral-framework/lib/i18n";
import { useMutation } from "coral-framework/lib/relay";
import {
  Button,
  FormField,
  FormFieldDescription,
  Label,
} from "coral-ui/components/v2";

import { ExternalModerationPhaseDangerZone_phase$key as ExternalModerationPhaseDangerZone_phase } from "coral-admin/__generated__/ExternalModerationPhaseDangerZone_phase.graphql";

import DeleteExternalModerationPhaseMutation from "./DeleteExternalModerationPhaseMutation";
import DisableExternalModerationPhaseMutation from "./DisableExternalModerationPhaseMutation";
import EnableExternalModerationPhaseMutation from "./EnableExternalModerationPhaseMutation";
import RotateSigningSecretModal from "./RotateSigningSecretModal";

interface Props {
  phase: ExternalModerationPhaseDangerZone_phase;
}

const ExternalModerationPhaseDangerZone: FunctionComponent<Props> = ({
  phase,
}) => {
  const phaseData = useFragment(
    graphql`
      fragment ExternalModerationPhaseDangerZone_phase on ExternalModerationPhase {
        id
        enabled
      }
    `,
    phase
  );

  const { localeBundles } = useCoralContext();
  const { router } = useRouter();
  const enableExternalModerationPhase = useMutation(
    EnableExternalModerationPhaseMutation
  );
  const disableExternalModerationPhase = useMutation(
    DisableExternalModerationPhaseMutation
  );
  const deleteExternalModerationPhase = useMutation(
    DeleteExternalModerationPhaseMutation
  );

  const [rotateSecretOpen, setRotateSecretOpen] = useState<boolean>(false);
  const onRotateSecret = useCallback(async () => {
    setRotateSecretOpen(true);
  }, []);
  const onHideRotateSecret = useCallback(async () => {
    setRotateSecretOpen(false);
  }, [setRotateSecretOpen]);

  const onEnable = useCallback(async () => {
    const message = getMessage(
      localeBundles,
      "configure-moderationPhases-confirmEnable",
      "Enabling the external moderation phase will start to send moderation queries to this URL. Are you sure you want to continue?"
    );

    // eslint-disable-next-line no-restricted-globals
    if (window.confirm(message)) {
      await enableExternalModerationPhase({ id: phaseData.id });
    }
  }, [localeBundles, enableExternalModerationPhase, phaseData.id]);
  const onDisable = useCallback(async () => {
    const message = getMessage(
      localeBundles,
      "configure-moderationPhases-confirmDisable",
      "Disabling this external moderation phase will stop any new moderation queries from being sent to this URL. Are you sure you want to continue?"
    );

    // eslint-disable-next-line no-restricted-globals
    if (window.confirm(message)) {
      await disableExternalModerationPhase({ id: phaseData.id });
    }
  }, [localeBundles, disableExternalModerationPhase, phaseData.id]);

  const onDelete = useCallback(async () => {
    const message = getMessage(
      localeBundles,
      "configure-moderationPhases-confirmDelete",
      "Deleting this external moderation phase will stop any new moderation queries from being sent to this URL and will remove all the associated settings. Are you sure you want to continue?"
    );

    // eslint-disable-next-line no-restricted-globals
    if (window.confirm(message)) {
      await deleteExternalModerationPhase({ id: phaseData.id });

      // Send the user back to the webhook endpoints listing.
      router.push(urls.admin.moderationPhases);
    }
  }, [localeBundles, deleteExternalModerationPhase, phaseData.id, router]);

  return (
    <>
      <Localized id="configure-moderationPhases-dangerZone">
        <Subheader>Danger Zone</Subheader>
      </Localized>
      <FormField>
        <Localized id="configure-moderationPhases-rotateSigningSecret">
          <Label>Rotate signing secret</Label>
        </Localized>
        <Localized id="configure-moderationPhases-rotateSigningSecretDescription">
          <FormFieldDescription>
            Rotating the signing secret will allow to you to safely replace a
            signing secret used in production with a delay.
          </FormFieldDescription>
        </Localized>
        <Localized id="configure-moderationPhases-rotateSigningSecretButton">
          <Button color="alert" onClick={onRotateSecret}>
            Rotate signing secret
          </Button>
        </Localized>
      </FormField>
      <RotateSigningSecretModal
        phaseID={phaseData.id}
        onHide={onHideRotateSecret}
        open={rotateSecretOpen}
      />
      {phaseData.enabled ? (
        <FormField>
          <Localized id="configure-moderationPhases-disableExternalModerationPhase">
            <Label>Disable external moderation phase</Label>
          </Localized>
          <Localized id="configure-moderationPhases-disableExternalModerationPhaseDescription">
            <FormFieldDescription>
              This external moderation phase is current enabled. By disabling,
              no new moderation queries will be sent to the URL provided.
            </FormFieldDescription>
          </Localized>
          <Localized id="configure-moderationPhases-disableExternalModerationPhaseButton">
            <Button color="alert" onClick={onDisable}>
              Disable phase
            </Button>
          </Localized>
        </FormField>
      ) : (
        <FormField>
          <Localized id="configure-moderationPhases-enableExternalModerationPhase">
            <Label>Enable external moderation phase</Label>
          </Localized>
          <Localized id="configure-moderationPhases-enableExternalModerationPhaseDescription">
            <FormFieldDescription>
              This external moderation phase is currently disabled. By enabling,
              new moderation queries will be sent to the URL provided.
            </FormFieldDescription>
          </Localized>
          <Localized id="configure-moderationPhases-enableExternalModerationPhaseButton">
            <Button color="regular" onClick={onEnable}>
              Enable phase
            </Button>
          </Localized>
        </FormField>
      )}
      <FormField>
        <Localized id="configure-moderationPhases-deleteExternalModerationPhase">
          <Label>Delete external moderation phase</Label>
        </Localized>
        <Localized id="configure-moderationPhases-deleteExternalModerationPhaseDescription">
          <FormFieldDescription>
            Deleting this external moderation phase will stop any new moderation
            queries from being sent to this URL and will remove all the
            associated settings.
          </FormFieldDescription>
        </Localized>
        <Localized id="configure-moderationPhases-deleteExternalModerationPhaseButton">
          <Button color="alert" onClick={onDelete}>
            Delete phase
          </Button>
        </Localized>
      </FormField>
    </>
  );
};

export default ExternalModerationPhaseDangerZone;
