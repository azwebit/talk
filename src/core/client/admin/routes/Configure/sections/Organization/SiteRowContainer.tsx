import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent } from "react";
import { graphql, useFragment } from "react-relay";

import { Button, Flex, Icon } from "coral-ui/components/v2";
import { TableCell, TableRow } from "coral-ui/components/v2/Table";

import { SiteRowContainer_site$key as SiteRowContainer_site } from "coral-admin/__generated__/SiteRowContainer_site.graphql";

interface Props {
  site: SiteRowContainer_site;
}

const SiteRowContainer: FunctionComponent<Props> = ({ site }) => {
  const siteData = useFragment(
    graphql`
      fragment SiteRowContainer_site on Site {
        id
        name
        createdAt
      }
    `,
    site
  );

  return (
    <TableRow>
      <TableCell>{siteData.name}</TableCell>
      <TableCell>
        <Flex justifyContent="flex-end">
          <Localized
            id="configure-sites-site-details"
            icon={<Icon>keyboard_arrow_right</Icon>}
          >
            <Button
              variant="text"
              to={`/admin/configure/organization/sites/${siteData.id}`}
              iconRight
            >
              Details
              <Icon>keyboard_arrow_right</Icon>
            </Button>
          </Localized>
        </Flex>
      </TableCell>
    </TableRow>
  );
};

export default SiteRowContainer;
