/*

 */

    .text
    .globl main

main:
    movq    %rsp, %rbp
    subq    $1, %rsp
    andb    $0x00,  %spl
    xor     %rax, %rax
    movabsq $fmt, %rdi
    movq    %rsp, %rsi
    call    printf
    movq    %rbp, %rsp
    ret

    .section    __TEXT,__cstring,cstring_literals
fmt:
    .asciz "%d"
