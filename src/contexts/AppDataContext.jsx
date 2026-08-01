import { createContext, useState } from 'react';
import { initialData } from '../mock/data';
import { calculateExpenseSettlement, getCurrentVersion, getExpenseVersions } from '../services/reconciliation';

export const AppDataContext = createContext(null);

function buildEqualSplits(memberIds, amount) {
  const count = Math.max(memberIds.length, 1);
  const evenAmount = Number((amount / count).toFixed(2));

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: index === count - 1 ? Number((amount - evenAmount * index).toFixed(2)) : evenAmount,
    percentage: Number((100 / count).toFixed(2)),
  }));
}

function buildSplitSet(splitType, amount, memberIds, allocations = []) {
  if (splitType === 'custom') {
    return memberIds.map((memberId) => {
      const allocation = allocations.find((entry) => entry.memberId === memberId);
      const memberAmount = Number(allocation?.value ?? 0);
      return {
        memberId,
        amount: memberAmount,
        percentage: Number(((memberAmount / amount) * 100 || 0).toFixed(2)),
      };
    });
  }

  if (splitType === 'percentage') {
    return memberIds.map((memberId) => {
      const allocation = allocations.find((entry) => entry.memberId === memberId);
      const percentage = Number(allocation?.value ?? 0);
      return {
        memberId,
        amount: Number(((amount * percentage) / 100).toFixed(2)),
        percentage,
      };
    });
  }

  return buildEqualSplits(memberIds, amount);
}

function scaleSplits(previousVersion, newAmount) {
  const previousTotal = previousVersion.amount || 1;

  if (previousVersion.splits.every((split) => split.percentage)) {
    return previousVersion.splits.map((split) => ({
      memberId: split.memberId,
      amount: Number(((newAmount * split.percentage) / 100).toFixed(2)),
      percentage: split.percentage,
    }));
  }

  return previousVersion.splits.map((split) => {
    const ratio = split.amount / previousTotal;
    return {
      memberId: split.memberId,
      amount: Number((newAmount * ratio).toFixed(2)),
      percentage: Number((ratio * 100).toFixed(2)),
    };
  });
}

function appendUniqueActivity(existing, nextActivity) {
  return [nextActivity, ...existing].slice(0, 20);
}

function appendUniqueNotification(existing, nextNotification) {
  return [nextNotification, ...existing].slice(0, 20);
}

export function AppDataProvider({ children }) {
  const [users] = useState(initialData.users);
  const [groups] = useState(initialData.groups);
  const [expenses, setExpenses] = useState(initialData.expenses);
  const [expenseVersions, setExpenseVersions] = useState(initialData.expenseVersions);
  const [payments] = useState(initialData.payments);
  const [refundRequests, setRefundRequests] = useState(initialData.refundRequests);
  const [notifications, setNotifications] = useState(initialData.notifications);
  const [activityLogs, setActivityLogs] = useState(initialData.activityLogs);
  const currentUser = users.find((user) => user.id === initialData.currentUserId);

  const addExpense = (payload) => {
    const amount = Number(payload.amount);
    const expenseId = `expense-${crypto.randomUUID().slice(0, 8)}`;
    const versionId = `${expenseId}-v1`;
    const newExpense = {
      id: expenseId,
      groupId: payload.groupId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      splitType: payload.splitType,
      memberIds: payload.memberIds,
      createdBy: currentUser.id,
      currentVersionId: versionId,
      status: 'pending-payments',
      date: payload.date,
    };
    const newVersion = {
      id: versionId,
      expenseId,
      versionNumber: 1,
      amount,
      date: new Date().toISOString(),
      editorId: currentUser.id,
      reason: 'Initial submission',
      splits: buildSplitSet(payload.splitType, amount, payload.memberIds, payload.allocations),
    };
    const group = groups.find((entry) => entry.id === payload.groupId);

    setExpenses((existing) => [newExpense, ...existing]);
    setExpenseVersions((existing) => [newVersion, ...existing]);
    setActivityLogs((existing) =>
      appendUniqueActivity(existing, {
        id: `activity-${crypto.randomUUID().slice(0, 6)}`,
        groupId: payload.groupId,
        expenseId,
        type: 'Expense Created',
        actorId: currentUser.id,
        description: `Created ${payload.title} in ${group?.name ?? 'the selected group'}.`,
        date: new Date().toISOString(),
      }),
    );
    setNotifications((existing) =>
      appendUniqueNotification(existing, {
        id: `notification-${crypto.randomUUID().slice(0, 6)}`,
        type: 'expense-updated',
        title: 'New expense created',
        message: `${payload.title} is ready for settlement tracking.`,
        date: new Date().toISOString(),
        read: false,
      }),
    );

    return expenseId;
  };

  const createExpenseVersion = (expenseId, payload) => {
    const expense = expenses.find((entry) => entry.id === expenseId);

    if (!expense) {
      return null;
    }

    const versions = getExpenseVersions(expenseId, expenseVersions);
    const previousVersion = versions.at(-1);
    const nextVersionNumber = (previousVersion?.versionNumber ?? 0) + 1;
    const newAmount = Number(payload.amount);
    const nextVersionId = `${expenseId}-v${nextVersionNumber}`;
    const nextVersion = {
      id: nextVersionId,
      expenseId,
      versionNumber: nextVersionNumber,
      amount: newAmount,
      date: new Date().toISOString(),
      editorId: currentUser.id,
      reason: payload.reason,
      splits:
        expense.splitType === 'equal'
          ? buildEqualSplits(expense.memberIds, newAmount)
          : scaleSplits(previousVersion, newAmount),
    };

    setExpenseVersions((existing) => [...existing, nextVersion]);
    setExpenses((existing) =>
      existing.map((entry) =>
        entry.id === expenseId
          ? { ...entry, currentVersionId: nextVersionId, status: 'needs-reconciliation' }
          : entry,
      ),
    );

    const nextSettlement = calculateExpenseSettlement(
      { ...expense, currentVersionId: nextVersionId },
      [...expenseVersions, nextVersion],
      payments,
      users,
    );

    const refundsToCreate = nextSettlement.rows
      .filter((row) => row.refund > 0)
      .map((row) => ({
        id: `refund-${crypto.randomUUID().slice(0, 6)}`,
        expenseId,
        senderId: currentUser.id,
        receiverId: row.memberId,
        amount: row.refund,
        status: 'pending',
        date: new Date().toISOString(),
      }));

    if (refundsToCreate.length) {
      setRefundRequests((existing) => [...refundsToCreate, ...existing]);
    }

    setActivityLogs((existing) =>
      appendUniqueActivity(existing, {
        id: `activity-${crypto.randomUUID().slice(0, 6)}`,
        groupId: expense.groupId,
        expenseId,
        type: 'Expense Edited',
        actorId: currentUser.id,
        description: `Created version ${nextVersionNumber} for ${expense.title}.`,
        date: new Date().toISOString(),
      }),
    );
    setNotifications((existing) =>
      appendUniqueNotification(existing, {
        id: `notification-${crypto.randomUUID().slice(0, 6)}`,
        type: 'expense-updated',
        title: 'Version created',
        message: `${expense.title} moved to version ${nextVersionNumber} without mutating payment history.`,
        date: new Date().toISOString(),
        read: false,
      }),
    );

    return nextVersion;
  };

  const setRefundStatus = (refundId, status) => {
    setRefundRequests((existing) =>
      existing.map((request) => (request.id === refundId ? { ...request, status } : request)),
    );
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((existing) =>
      existing.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
  };

  const inviteMember = (groupId, emailAddress) => {
    const group = groups.find((entry) => entry.id === groupId);

    setNotifications((existing) =>
      appendUniqueNotification(existing, {
        id: `notification-${crypto.randomUUID().slice(0, 6)}`,
        type: 'expense-updated',
        title: 'Invite drafted',
        message: `Invite prepared for ${emailAddress} in ${group?.name ?? 'the selected group'}.`,
        date: new Date().toISOString(),
        read: false,
      }),
    );
    setActivityLogs((existing) =>
      appendUniqueActivity(existing, {
        id: `activity-${crypto.randomUUID().slice(0, 6)}`,
        groupId,
        type: 'Invite Member',
        actorId: currentUser.id,
        description: `Prepared a development invite for ${emailAddress}.`,
        date: new Date().toISOString(),
      }),
    );
  };

  const recordDirectPayment = ({ recipientName, phone, amount, note, paymentId }) => {
    const cleanPaymentId = paymentId || `pay_gpay_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    setNotifications((existing) =>
      appendUniqueNotification(existing, {
        id: `notification-${crypto.randomUUID().slice(0, 6)}`,
        type: 'payment-request',
        title: `Paid ₹${amount} to ${recipientName}`,
        message: `Phone: ${phone || 'N/A'} • Note: ${note || 'Direct Payment'} • ID: ${cleanPaymentId}`,
        date: new Date().toISOString(),
        read: false,
      }),
    );

    setActivityLogs((existing) =>
      appendUniqueActivity(existing, {
        id: `activity-${crypto.randomUUID().slice(0, 6)}`,
        type: 'Payment Completed',
        actorId: currentUser.id,
        description: `Sent ₹${amount} to ${recipientName} (${phone || 'Direct'}) via GPay Engine.`,
        date: new Date().toISOString(),
      }),
    );

    return cleanPaymentId;
  };

  const recordDirectRequest = ({ recipientName, phone, amount, note, requestId }) => {
    const cleanRequestId = requestId || `req_gpay_${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setNotifications((existing) =>
      appendUniqueNotification(existing, {
        id: `notification-${crypto.randomUUID().slice(0, 6)}`,
        type: 'payment-request',
        title: `Requested ₹${amount} from ${recipientName}`,
        message: `Phone: ${phone || 'N/A'} • Note: ${note || 'Payment Request'} • Req ID: ${cleanRequestId}`,
        date: new Date().toISOString(),
        read: false,
      }),
    );

    setActivityLogs((existing) =>
      appendUniqueActivity(existing, {
        id: `activity-${crypto.randomUUID().slice(0, 6)}`,
        type: 'Payment Request Sent',
        actorId: currentUser.id,
        description: `Requested ₹${amount} from ${recipientName} (${phone || 'Direct'}).`,
        date: new Date().toISOString(),
      }),
    );

    return cleanRequestId;
  };

  const value = {
    currentUser,
    users,
    groups,
    expenses,
    expenseVersions,
    payments,
    refundRequests,
    notifications,
    activityLogs,
    addExpense,
    createExpenseVersion,
    markNotificationRead,
    setRefundStatus,
    inviteMember,
    recordDirectPayment,
    recordDirectRequest,
    getCurrentVersion: (expense) => getCurrentVersion(expense, expenseVersions),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
