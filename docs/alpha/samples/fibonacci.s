
    .section ".text"
    .globl main
    .type main,@function
main:
    pushl  $1
    pushl  $1
loop:
    movl   $0,      %eax
    addl   $1,      %eax
    movl   4(%rsp), %ebx
    movl   (%rsp),  %ecx
    addl   %ecx,    %ebx
    jb     end
    pushl  %ebx
    jmp    loop
 end:
    popl   %eax
    ret