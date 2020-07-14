module.exports = [
    {
        name: 'id',
        addToResponse: true,
        userWritable: false,
        canSortBy: true,
        canFilterBy: true,
        canSearchBy: false,
        isJSON: false,
        validateRule: 'number',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'title',
        addToResponse: true,
        userWritable: true,
        canSortBy: true,
        canFilterBy: true,
        canSearchBy: true,
        isJSON: false,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'filename',
        addToResponse: true,
        userWritable: true,
        canSortBy: true,
        canFilterBy: true,
        canSearchBy: false,
        isJSON: false,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'meta',
        addToResponse: true,
        userWritable: true,
        canSortBy: false,
        canFilterBy: false,
        canSearchBy: true,
        isJSON: true,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'created_at',
        addToResponse: true,
        userWritable: false,
        canSortBy: true,
        canFilterBy: true,
        canSearchBy: false,
        isJSON: false,
        validateRule: 'date',
        sanitizeRule: 'to_date',
        required: false
    },
    {
        name: 'updated_at',
        addToResponse: true,
        userWritable: false,
        canSortBy: true,
        canFilterBy: true,
        canSearchBy: false,
        isJSON: false,
        validateRule: 'date',
        sanitizeRule: 'to_date',
        required: false
    }
]
