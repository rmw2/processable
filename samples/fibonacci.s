    .text
    .globl fib
fib:
    pushq   %rbp
    movq    %rsp, %rbp
    subq    $8, %rsp
    cmpq    $1, %rdi
    jle     .base

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

    .globl _main
_main:
    pushq   %rbp
    movq    %rsp, %rbp

    call    fib
    movq    %rax, %rdi
    popq    %rbp
    ret