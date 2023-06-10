// everything here MUST exist except "expect"

module.exports = {
    name: 'This should succeed',
    expect: '500', // defaluts to true if not specified
    test: async(DB) => {
        // this succeeds because value AND types are the same

        return '500';
    }
}