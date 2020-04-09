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
        name: 'type',
        addToResponse: true,
        userWritable: false,
        canSortBy: false,
        canFilterBy: true,
        canSearchBy: false,
        isJSON: false,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'email',
        addToResponse: true,
        userWritable: false,
        canSortBy: false,
        canFilterBy: false,
        canSearchBy: false,
        isJSON: false,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'validated',
        addToResponse: true,
        userWritable: false,
        canSortBy: false,
        canFilterBy: false,
        canSearchBy: false,
        isJSON: false,
        validateRule: '',
        sanitizeRule: '',
        required: false, // even thou it is required, we generate it so user does not need to send it
    },
    {
        name: 'social_id',
        addToResponse: true,
        userWritable: false,
        canSortBy: false,
        canFilterBy: false,
        canSearchBy: false,
        isJSON: false,
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
