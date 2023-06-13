import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Button, Textarea } from "@kleros/ui-components-library";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import { wrapWithToast } from "utils/wrapWithToast";
import { useWalletClient, usePublicClient } from "wagmi";
import { prepareWriteDisputeKitClassic } from "hooks/contracts/generated";

const Binary: React.FC<{ arbitrable?: string; voteIDs: string[] }> = ({ arbitrable, voteIDs }) => {
  const { id } = useParams();
  const parsedDisputeID = BigInt(id!);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const [chosenOption, setChosenOption] = useState(-1);
  const [isSending, setIsSending] = useState(false);
  const [justification, setJustification] = useState("");
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return id ? (
    <Container>
      <MainContainer>
        <h1>{metaEvidence?.question}</h1>
        <StyledTextarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Justify your vote..."
          message={
            "A good justification contributes to case comprehension. " + "Low quality justifications can be challenged."
          }
          variant="info"
        />
        <OptionsContainer>
          {metaEvidence?.rulingOptions?.titles?.map((answer: string, i: number) => (
            <Button
              key={i}
              text={answer}
              disabled={isSending}
              isLoading={chosenOption === i + 1}
              onClick={async () => {
                setIsSending(true);
                setChosenOption(i + 1);
                const { request } = await prepareWriteDisputeKitClassic({
                  functionName: "castVote",
                  args: [parsedDisputeID, parsedVoteIDs, BigInt(i + 1), 0n, justification],
                });
                wrapWithToast(walletClient!.writeContract(request)).finally(() => {
                  setChosenOption(-1);
                  setIsSending(false);
                });
              }}
            />
          ))}
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <Button
          variant="secondary"
          text="Refuse to Arbitrate"
          disabled={isSending}
          isLoading={chosenOption === 0}
          onClick={async () => {
            setIsSending(true);
            setChosenOption(0);
            const { request } = await prepareWriteDisputeKitClassic({
              functionName: "castVote",
              args: [parsedDisputeID, parsedVoteIDs, 0n, 0n, justification],
            });
            wrapWithToast(walletClient!.writeContract(request)).finally(() => {
              setChosenOption(-1);
              setIsSending(false);
            });
          }}
        />
      </RefuseToArbitrateContainer>
    </Container>
  ) : (
    <></>
  );
};
const Container = styled.div`
  width: 100%;
  height: auto;
`;
const MainContainer = styled.div`
  width: 100%;
  height: auto;
`;
const StyledTextarea = styled(Textarea)`
  width: 100%;
  height: auto;
  textarea {
    height: 200px;
    border-color: ${({ theme }) => theme.stroke};
  }
  small {
    font-weight: 400;
    hyphens: auto;
  }
`;
const OptionsContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;
const RefuseToArbitrateContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 32px;
  display: flex;
  justify-content: center;
`;
export default Binary;
