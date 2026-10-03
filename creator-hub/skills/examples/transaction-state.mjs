// Adapter for TransactionGetResultResponse / TransactionWaitResultResponse at the pinned source.
// The caller must match transaction_id and network to the operation being reconciled.
export function classifyTransaction(response) {
  if (!response || typeof response !== 'object') return { state: 'unknown' };
  const outcome = response.result?.result;
  const has = (key) => outcome && typeof outcome === 'object' && Object.hasOwn(outcome, key);
  if (response.status === 'OnlyFeeAccepted' || has('AcceptFeeRejectRest')) {
    return { state: 'failed', feeMayBeCharged: true };
  }
  if (['Rejected', 'InvalidTransaction', 'DryRunFailed'].includes(response.status) || has('Reject')) {
    return { state: 'failed', feeMayBeCharged: true };
  }
  // A timeout never authorizes optimistic success or resubmission.
  if (response.timed_out) return { state: 'unknown' };
  if (response.status === 'Accepted' && has('Accept') && Object.keys(outcome).length === 1) {
    return { state: 'accepted' };
  }
  if (response.status === 'DryRun') return { state: 'simulated' };
  if (['New', 'Pending'].includes(response.status)) return { state: 'pending' };
  return { state: 'unknown' };
}
