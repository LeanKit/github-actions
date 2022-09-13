"use strict";

const { getInput, setFailed } = require("@actions/core");
const leankitApiFactory = require("../leankit");

function validateParams(params) {
	const values = [];
	for (const param of params) {
		const value = getInput(param);
		if (!value) {
			throw new Error(`Expected '${param}' action parameter`);
		}
		values.push(value);
	}
	return values;
}

(async () => {
	const [
		apiToken,
		cardId,
		host,
		blockReason
	] = validateParams(["apiToken", "cardId", "host", "blockReason"]);
	const isBlocked = getInput("isBlocked") !== false;

	const { blockCard } = leankitApiFactory(host, apiToken);

	await blockCard(cardId, isBlocked, blockReason);
})().catch(ex => {
	setFailed(ex.message);
});
