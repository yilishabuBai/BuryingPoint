module.exports = {
    parserOptions: {
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: true,
        commonjs: true
    },
    rules: {
        'semi': 'warn', // 要求或禁止使用分号代替 ASI
        'curly': 'warn',    // 强制所有控制语句使用一致的括号风格
        // 'no-multi-spaces': 'warn',  // 禁止使用多个空格
        'space-infix-ops': 'warn',  // 要求操作符周围有空格
        'space-before-function-paren': 'warn',  // 强制在 function的左括号之前使用一致的空格
        // 'no-unused-vars': 'warn',   // 禁止出现未使用过的变量
        'no-use-before-define': 'error',    // 禁止在变量定义之前使用它们
        'no-empty': [   // 禁止出现空语句块
            'error',
            {
                'allowEmptyCatch': true // 允许出现空的 catch 子句
            }
        ],
        'eqeqeq': [ // 要求使用 === 和 !==
            'error',
            'smart' // 比较两个字面量的值, 比较 typeof 的值, 与 null 进行比较
        ],
        'no-dupe-keys': 'error',    // 禁止对象字面量中出现重复的 key
        // 'no-magic-numbers': [   // 禁用魔术数字
        //     'warn',
        //     {
        //         'ignoreArrayIndexes': true  // 指定数字用作数组的索引是否是可以
        //     }
        // ],
        'no-redeclare': 'error',    // 禁止多次声明同一变量
        'no-self-compare': 'error', // 禁止自身比较
        'no-unmodified-loop-condition': 'error',    // 禁用一成不变的循环条件
        'no-useless-return': 'error',   // 禁止多余的 return 语句
        'no-undef': 'error',    // 禁用未声明的变量，除非它们在 globals 注释中被提到
        'prefer-const': 'off',
        'no-var': 'off'
    },
    globals: {
    }
};