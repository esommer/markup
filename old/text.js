// #Here is a Title#

// I want to be able to write my own simple markdown. I want it to parse **bold**, //italics//, __underline__, --crossed out--, and {{http://google.com | links}}.

// It should also support:
//     - lists
//     - that are made with
//     - dashes, stars, bullets and tabs.
//         - sublists too.

// ##Here is a sub-heading##
// ```
// code blocks should ignore all those lines except *bold* and // or # for comments
// ```
// ----
// The tilda should escape special characters: ~# should print an octothorpe.

module.exports = "#Here is a Title#\n\nI want to be able to write my own simple markdown. I want it to parse **bold**, //italics//, __underline__, --crossed out--, and {{http://google.com | links}}.\n\nIt should also support:\n\t- lists\n\t- that are made with\n\t- dashes, stars, bullets and tabs.\n\t\t- sublists too.\n\n##Here is a sub-heading##\n\n```\ncode blocks should ignore all those lines except *bold* and // or # for comments\n```\n----\n\nThe tilda should escape special characters: ~# should print an octothorpe.";
