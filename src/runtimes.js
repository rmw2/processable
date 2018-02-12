/**
 *
 */

const crt0 = [
    ['movq', '%rsp', '%rbp'],
    ['movq', '$0', '%rdi'],
    ['movq' ,'$0', '%rsi'],
    ['call','main'],
    ['movq' ,'%rax', '%rdi'],
    ['call' ,'exit']
];

export default crt0;