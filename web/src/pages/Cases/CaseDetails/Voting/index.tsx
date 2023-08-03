import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useLockBodyScroll } from "react-use";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "queries/useDrawQuery";
import Classic from "./Classic";
import VotingHistory from "./VotingHistory";
import Popup, { PopupType } from "components/Popup";
import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";
import { getPeriodEndTimestamp } from "components/DisputeCard";
import { useDisputeKitClassicIsVoteActive } from "hooks/contracts/generated";
import VoteIcon from "assets/svgs/icons/voted.png";

function formatDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const Voting: React.FC<{
  arbitrable?: `0x${string}`;
  currentPeriodIndex?: number;
}> = ({ arbitrable, currentPeriodIndex }) => {
  const { address } = useAccount();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteID;
  const { data: voted } = useDisputeKitClassicIsVoteActive({
    enabled: !isUndefined(roundId) && !isUndefined(voteId),
    args: [BigInt(id ?? 0), roundId, voteId],
    watch: true,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useLockBodyScroll(isPopupOpen);
  const lastPeriodChange = disputeData?.dispute?.lastPeriodChange;
  const timesPerPeriod = disputeData?.dispute?.court?.timesPerPeriod;
  const finalDate =
    !isUndefined(currentPeriodIndex) &&
    !isUndefined(timesPerPeriod) &&
    getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, timesPerPeriod);

  return (
    <>
      {isPopupOpen && (
        <Popup
          title="Thanks for Voting"
          icon={VoteIcon}
          popupType={disputeData?.court?.hiddenVotes ? PopupType.VOTE_WITHOUT_COMMIT : PopupType.VOTE_WITH_COMMIT}
          date={finalDate ? formatDate(finalDate) : ""}
          isCommit={false}
          setIsOpen={setIsPopupOpen}
        />
      )}
      {drawData &&
      !isUndefined(arbitrable) &&
      currentPeriodIndex === Periods.vote &&
      drawData.draws?.length > 0 &&
      !voted ? (
        <Classic {...{ arbitrable }} setIsOpen={setIsPopupOpen} voteIDs={drawData.draws.map((draw) => draw.voteID)} />
      ) : (
        <VotingHistory {...{ arbitrable }} />
      )}
    </>
  );
};

export default Voting;
