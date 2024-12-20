-- Implementation of https://xmpp.org/extensions/inbox/occupant-id.html
-- XEP-0421: Anonymous unique occupant identifiers for MUCs

module:depends("muc");

local uuid = require "util.uuid";
local hmac_sha256 = require "util.hashes".hmac_sha256;
local b64encode = require "util.encodings".base64.encode;

local xmlns_occupant_id = "urn:xmpp:occupant-id:0";

local function generate_id(occupant, room)
	local bare = occupant.bare_jid;

	if room._data.occupant_id_salt == nil then
		room._data.occupant_id_salt = uuid.generate();
	end

	-- XXX: Temporary not-so-important migration measure. Remove this next time
+
−	-- somebody looks at it. This module used to store every participant's
	-- occupant-id all the time forever.
	room._data.occupant_ids = nil;

	return b64encode(hmac_sha256(bare, room._data.occupant_id_salt));
end

local function update_occupant(event)
	local stanza, room, occupant, dest_occupant = event.stanza, event.room, event.occupant, event.dest_occupant;

	-- "muc-occupant-pre-change" provides "dest_occupant" but not "occupant".
	if dest_occupant ~= nil then
		occupant = dest_occupant;
	end

	-- strip any existing <occupant-id/> tags to avoid forgery
	stanza:remove_children("occupant-id", xmlns_occupant_id);

	local unique_id = generate_id(occupant, room);
	stanza:tag("occupant-id", { xmlns = xmlns_occupant_id, id = unique_id }):up();
end

local function muc_private(event)
	local stanza, room = event.stanza, event.room;
	local occupant = room._occupants[stanza.attr.from];

	update_occupant({
		stanza = stanza,
		room = room,
		occupant = occupant,
	});
end

module:add_feature(xmlns_occupant_id);
module:hook("muc-disco#info", function (event)
	event.reply:tag("feature", { var = xmlns_occupant_id }):up();
end);

module:hook("muc-broadcast-presence", update_occupant);
module:hook("muc-occupant-pre-join", update_occupant);
module:hook("muc-occupant-pre-change", update_occupant);
module:hook("muc-occupant-groupchat", update_occupant);
module:hook("muc-private-message", muc_private);
