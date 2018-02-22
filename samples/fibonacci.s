    .section ".text"

    .globl fib
    .type fib,@function
fib:
    pushq   %rbp
    movq    %rsp, %rbp
    subq    $8, %rsp
    cmpq    %rdi, $1
    jae     .base

.recur:
    subq    $1, %rdi
    call    fib
    movq    %rax, -8(%rbp)
    subq    $1, %rdi
    call    fib
    addq    -8(%rbp), %rax
    addq    $8, %rsp
    popq    %rbp
    ret

.base:
    movq    %rdi, %rax
    addq    $8, %rsp
    popq    %rbp
    ret

    .globl main
    .type main,@function
main:
    pushq   %rbp
    movq    %rsp, %rbp

    call    fib
    popq    %rbp
    ret