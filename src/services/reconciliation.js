function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getExpenseVersions(expenseId, expenseVersions) {
  return expenseVersions
    .filter((version) => version.expenseId === expenseId)
    .sort((left, right) => left.versionNumber - right.versionNumber);
}

export function getCurrentVersion(expense, expenseVersions) {
  return expenseVersions.find((version) => version.id === expense.currentVersionId) ?? null;
}

export function getPreviousVersion(expense, expenseVersions) {
  const history = getExpenseVersions(expense.id, expenseVersions);
  return history.at(-2) ?? history.at(-1) ?? null;
}

export function calculateExpenseSettlement(expense, expenseVersions, payments, users) {
  const history = getExpenseVersions(expense.id, expenseVersions);
  const currentVersion = history.at(-1);
  const previousVersion = history.at(-2) ?? history.at(-1);

  if (!currentVersion) {
    return {
      currentVersion: null,
      previousVersion: null,
      rows: [],
      collectionTotal: 0,
      refundTotal: 0,
      settledCount: 0,
    };
  }

  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));
  const previousShareMap = Object.fromEntries(
    (previousVersion?.splits ?? []).map((split) => [split.memberId, split.amount]),
  );
  const currentShareMap = Object.fromEntries(
    currentVersion.splits.map((split) => [split.memberId, split.amount]),
  );
  const paidMap = payments
    .filter((payment) => payment.expenseId === expense.id && payment.status === 'paid')
    .reduce((accumulator, payment) => {
      accumulator[payment.memberId] = roundCurrency(
        (accumulator[payment.memberId] ?? 0) + payment.amount,
      );
      return accumulator;
    }, {});

  const rows = expense.memberIds.map((memberId) => {
    const oldShare = roundCurrency(previousShareMap[memberId] ?? currentShareMap[memberId] ?? 0);
    const newShare = roundCurrency(currentShareMap[memberId] ?? 0);
    const paid = roundCurrency(paidMap[memberId] ?? 0);
    const delta = roundCurrency(newShare - paid);
    const refund = delta < 0 ? Math.abs(delta) : 0;
    const remaining = delta > 0 ? delta : 0;
    const status = refund > 0 ? 'refund' : remaining > 0 ? 'pending' : 'paid';

    return {
      memberId,
      member: userMap[memberId],
      oldShare,
      newShare,
      paid,
      remaining,
      refund,
      delta: roundCurrency(newShare - oldShare),
      status,
    };
  });

  return {
    currentVersion,
    previousVersion,
    rows,
    collectionTotal: rows.reduce((total, row) => total + row.remaining, 0),
    refundTotal: rows.reduce((total, row) => total + row.refund, 0),
    settledCount: rows.filter((row) => row.status === 'paid').length,
  };
}

export function calculateGroupBalances(group, expenses, expenseVersions, payments, users) {
  const base = Object.fromEntries(
    group.memberIds.map((memberId) => [
      memberId,
      {
        member: users.find((user) => user.id === memberId),
        paid: 0,
        shouldPay: 0,
        remaining: 0,
        refund: 0,
        status: 'paid',
      },
    ]),
  );

  expenses
    .filter((expense) => expense.groupId === group.id)
    .forEach((expense) => {
      const settlement = calculateExpenseSettlement(expense, expenseVersions, payments, users);

      settlement.rows.forEach((row) => {
        base[row.memberId].paid = roundCurrency(base[row.memberId].paid + row.paid);
        base[row.memberId].shouldPay = roundCurrency(base[row.memberId].shouldPay + row.newShare);
        base[row.memberId].remaining = roundCurrency(base[row.memberId].remaining + row.remaining);
        base[row.memberId].refund = roundCurrency(base[row.memberId].refund + row.refund);
      });
    });

  return Object.values(base).map((entry) => {
    let status = 'paid';

    if (entry.refund > 0) {
      status = 'refund';
    } else if (entry.remaining > entry.shouldPay * 0.4) {
      status = 'overdue';
    } else if (entry.remaining > 0) {
      status = 'pending';
    }

    return { ...entry, status };
  });
}

export function calculatePortfolioBalances(groups, expenses, expenseVersions, payments, users) {
  return groups.map((group) => ({
    group,
    rows: calculateGroupBalances(group, expenses, expenseVersions, payments, users),
  }));
}

export function calculateDashboardStats({
  groups,
  expenses,
  expenseVersions,
  payments,
  refundRequests,
  users,
}) {
  const settlements = expenses.map((expense) =>
    calculateExpenseSettlement(expense, expenseVersions, payments, users),
  );
  const pendingPayments = settlements.reduce(
    (total, settlement) => total + settlement.rows.filter((row) => row.remaining > 0).length,
    0,
  );
  const activeExpenses = expenses.filter((expense) => expense.status !== 'settled').length;
  const pendingRefunds = refundRequests.filter((request) => request.status === 'pending').length;
  const settledMembers = settlements.reduce((total, settlement) => total + settlement.settledCount, 0);
  const totalMembers = settlements.reduce((total, settlement) => total + settlement.rows.length, 0);
  const settlementProgress = totalMembers ? Math.round((settledMembers / totalMembers) * 100) : 0;

  return {
    totalGroups: groups.length,
    pendingPayments,
    pendingRefunds,
    activeExpenses,
    settlementProgress,
  };
}
