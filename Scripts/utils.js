function normalizeOptions(args) {
    const options = (args)
        ? args
            .replaceAll("\n", " ") // NOTE: a string config key can contain newlines
            .split(" ")
            .map((option) => option.trim())
            .filter((option) => option !== "")
        : [];

    return options;
}

module.exports.normalizeOptions = normalizeOptions;
