export const run = async () => {
  const res = await fetch("http://localhost:3000/api/campaigns/status?runId=mock_run&listId=mock_list_id&campaignIds=mock_campaign_id");
  console.log(await res.json());
}
run();
