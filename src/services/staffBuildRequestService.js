const StaffBuildRequest = require('../models/staffBuildRequestModel');
const UserBuild = require('../models/userBuildModel');

const ALLOWED_STATUS = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'];

const normalizePositiveInt = (value, fieldName, required = false) => {
    if (value === undefined || value === null || value === '') {
        if (required) {
            throw new Error(`${fieldName} is required and must be a valid integer`);
        }
        return null;
    }

    const normalized = Number(value);
    if (!Number.isInteger(normalized) || normalized <= 0) {
        throw new Error(`${fieldName} must be a valid integer`);
    }

    return normalized;
};

const normalizeBudget = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const budget = Number(value);
    if (Number.isNaN(budget) || budget < 0) {
        throw new Error('budget_range must be a non-negative number');
    }

    return Number(budget.toFixed(2));
};

const normalizeStatus = (value, required = false) => {
    if (value === undefined || value === null || String(value).trim() === '') {
        if (required) {
            return 'pending';
        }
        return null;
    }

    const normalized = String(value).trim().toLowerCase();

    if (!ALLOWED_STATUS.includes(normalized)) {
        throw new Error(`status must be one of: ${ALLOWED_STATUS.join(', ')}`);
    }

    return normalized;
};

const normalizeText = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const text = String(value).trim();
    return text.length ? text : null;
};

const mapRecord = (record) => ({
    ...record,
    budget_range: record.budget_range !== null ? Number(record.budget_range) : null,
    total_price: record.total_price !== null ? Number(record.total_price) : null
});

exports.getAllStaffBuildRequests = async (query) => {
    const filters = {
        status: normalizeStatus(query.status, false),
        user_id: normalizePositiveInt(query.user_id, 'user_id', false),
        staff_id: normalizePositiveInt(query.staff_id, 'staff_id', false)
    };

    const result = await StaffBuildRequest.getAll(filters);
    return result.recordset.map(mapRecord);
};

exports.getStaffBuildRequestsByUserId = async (userId) => {
    const normalizedUserId = normalizePositiveInt(userId, 'user_id', true);
    const result = await StaffBuildRequest.getAll({ user_id: normalizedUserId });
    return result.recordset.map(mapRecord);
};

exports.getStaffBuildRequestById = async (id) => {
    const requestId = normalizePositiveInt(id, 'request_id', true);
    const result = await StaffBuildRequest.getById(requestId);

    if (!result.recordset[0]) {
        return null;
    }

    return mapRecord(result.recordset[0]);
};

exports.createStaffBuildRequest = async (payload) => {
    const data = {
        user_id: normalizePositiveInt(payload.user_id, 'user_id', true),
        staff_id: normalizePositiveInt(payload.staff_id, 'staff_id', false),
        customer_note: normalizeText(payload.customer_note),
        budget_range: normalizeBudget(payload.budget_range),
        status: normalizeStatus(payload.status, true),
        user_build_id: normalizePositiveInt(payload.user_build_id, 'user_build_id', false)
    };

    const result = await StaffBuildRequest.create(data);
    return await exports.getStaffBuildRequestById(result.recordset[0].request_id);
};

exports.updateStaffBuildRequest = async (id, payload) => {
    const requestId = normalizePositiveInt(id, 'request_id', true);
    const existing = await exports.getStaffBuildRequestById(requestId);

    if (!existing) {
        throw new Error('Staff build request not found');
    }

    const mergedData = {
        user_id: payload.user_id !== undefined
            ? normalizePositiveInt(payload.user_id, 'user_id', true)
            : existing.user_id,
        staff_id: payload.staff_id !== undefined
            ? normalizePositiveInt(payload.staff_id, 'staff_id', false)
            : existing.staff_id,
        customer_note: payload.customer_note !== undefined
            ? normalizeText(payload.customer_note)
            : existing.customer_note,
        budget_range: payload.budget_range !== undefined
            ? normalizeBudget(payload.budget_range)
            : existing.budget_range,
        status: payload.status !== undefined
            ? normalizeStatus(payload.status, false)
            : existing.status,
        user_build_id: payload.user_build_id !== undefined
            ? normalizePositiveInt(payload.user_build_id, 'user_build_id', false)
            : existing.user_build_id
    };

    await StaffBuildRequest.update(requestId, mergedData);
    return await exports.getStaffBuildRequestById(requestId);
};

exports.deleteStaffBuildRequest = async (id) => {
    const requestId = normalizePositiveInt(id, 'request_id', true);
    const existing = await exports.getStaffBuildRequestById(requestId);

    if (!existing) {
        throw new Error('Staff build request not found');
    }

    await StaffBuildRequest.delete(requestId);
    return { message: 'Staff build request deleted successfully' };
};

const normalizeItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('items is required and must be a non-empty array');
    }

    const normalized = items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity || 1)
    }));

    for (const item of normalized) {
        if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
            throw new Error('Each item must include a valid product_id');
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('Each item must include a valid quantity (>= 1)');
        }
    }

    return normalized;
};

const snapshotItemsAndTotal = async (items) => {
    const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];
    const productsResult = await UserBuild.getProductsByIds(uniqueProductIds);
    const products = productsResult.recordset;

    if (products.length !== uniqueProductIds.length) {
        throw new Error('One or more products were not found');
    }

    const productMap = new Map(products.map((product) => [product.product_id, product]));
    const totalPrice = Number(
        items.reduce((sum, item) => {
            const product = productMap.get(item.product_id);
            return sum + Number(product.price || 0) * item.quantity;
        }, 0).toFixed(2)
    );

    return { totalPrice };
};

exports.createMyStaffBuildRequest = async (authUserId, payload) => {
    const userId = normalizePositiveInt(authUserId, 'user_id', true);
    const customerNote = normalizeText(payload.customer_note);
    const budgetRange = normalizeBudget(payload.budget_range);

    if (!customerNote) {
        throw new Error('customer_note is required');
    }

    if (budgetRange === null) {
        throw new Error('budget_range is required and must be a non-negative number');
    }

    const result = await StaffBuildRequest.createFromCustomer({
        user_id: userId,
        customer_note: customerNote,
        budget_range: budgetRange
    });

    return await exports.getStaffBuildRequestById(result.recordset[0].request_id);
};

exports.getMyStaffBuildRequests = async (authUserId) => {
    const userId = normalizePositiveInt(authUserId, 'user_id', true);
    const result = await StaffBuildRequest.getAll({ user_id: userId });
    return result.recordset.map(mapRecord);
};

exports.getMyAssignedRequests = async (authStaffId, query) => {
    const staffId = normalizePositiveInt(authStaffId, 'staff_id', true);
    const status = query.status !== undefined ? normalizeStatus(query.status, false) : null;
    const result = await StaffBuildRequest.getAll({ staff_id: staffId, status });
    return result.recordset.map(mapRecord);
};

exports.assignStaffBuildRequest = async (requestId, authStaffId) => {
    const normalizedRequestId = normalizePositiveInt(requestId, 'request_id', true);
    const staffId = normalizePositiveInt(authStaffId, 'staff_id', true);
    const existing = await exports.getStaffBuildRequestById(normalizedRequestId);

    if (!existing) {
        throw new Error('Staff build request not found');
    }

    if (existing.user_build_id) {
        throw new Error('Request already has a completed build');
    }

    if (existing.staff_id && existing.staff_id !== staffId) {
        throw new Error('Request already assigned to another staff');
    }

    await StaffBuildRequest.assignToStaff(normalizedRequestId, staffId);
    return await exports.getStaffBuildRequestById(normalizedRequestId);
};

exports.submitBuildForRequest = async (requestId, authStaffId, payload) => {
    const normalizedRequestId = normalizePositiveInt(requestId, 'request_id', true);
    const staffId = normalizePositiveInt(authStaffId, 'staff_id', true);
    const existing = await exports.getStaffBuildRequestById(normalizedRequestId);

    if (!existing) {
        throw new Error('Staff build request not found');
    }

    if (existing.user_build_id) {
        throw new Error('Request already submitted');
    }

    if (existing.staff_id && existing.staff_id !== staffId) {
        throw new Error('Request already assigned to another staff');
    }

    const buildName = normalizeText(payload.build_name);
    if (!buildName) {
        throw new Error('build_name is required');
    }

    const normalizedItems = normalizeItems(payload.items);
    const { totalPrice } = await snapshotItemsAndTotal(normalizedItems);

    const createdBuild = await UserBuild.createUserBuildWithItems({
        userId: existing.user_id,
        buildName,
        totalPrice,
        items: normalizedItems
    });

    await StaffBuildRequest.submitBuild(normalizedRequestId, staffId, createdBuild.user_build_id);
    return await exports.getStaffBuildRequestById(normalizedRequestId);
};
