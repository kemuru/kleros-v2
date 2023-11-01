import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;

  ${landscapeStyle(
    () =>
      css`
        width: 110px;
      `
  )}
`;

const StyledLockedStakeLabel = styled.label`
  display: flex;
  font-size: 12px !important;

  ${landscapeStyle(
    () =>
      css`
        font-size: 14px !important;
      `
  )}
`;

const lockedStakeTooltipMsg =
  "When a juror is selected to arbitrate a case, part of their stake (PNK) is " +
  "locked until the case is resolved. Jurors whose vote is coherent with the " +
  "final jury decision have their locked stake released. Jurors whose vote " +
  "is not coherent with the final jury decision, lose their locked stake. " +
  "The locked stake of incoherent jurors is redistributed as incentives for " +
  "the coherent jurors.";

const LockedStake: React.FC = () => {
  return (
    <Container>
      <WithHelpTooltip place="left" tooltipMsg={lockedStakeTooltipMsg}>
        <StyledLockedStakeLabel> Locked Stake </StyledLockedStakeLabel>
      </WithHelpTooltip>
    </Container>
  );
};
export default LockedStake;
