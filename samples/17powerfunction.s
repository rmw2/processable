        ## ============================================================
        ## 17powerfunction.s
        ## ============================================================

        ## ============================================================
                                .section ".data"
        ## ============================================================

pcPrompt1:
        .asciz  "Enter the base:  "

pcPrompt2:
        .asciz  "Enter the exponent:  "

pcScanfFormat:
        .asciz  "%d"

pcResult:
        .asciz  "%d raised to the %d power is %d.\n"

        ## ============================================================
                                .section ".bss"
        ## ============================================================

        ## ============================================================
                                .section ".text"
        ## ============================================================

        ## ------------------------------------------------------------
        ## int power(int iBase, int iExp)
        ##
        ## Return iBase raised to the iExp power, where iBase and iExp
        ## are non-negative.
        ##
        ## Formal parameter offsets:
        ##         .equ IBASE,    8
        ##         .equ IEXP,     12
        ## Local variable offsets:
        ##         .equ IPOWER,  -4
        ##         .equ IINDEX,  -8
        ## ------------------------------------------------------------

power:

        pushl   %ebp
        movl    %esp, %ebp

        ## int iPower = 1;
        movl    $1, %eax
        pushl   %eax

        ## int iIndex;
        movl    $0, %eax
        pushl   %eax

        ## iIndex = 1;
        movl    $1, %eax
        movl    %eax, -8(%ebp)

loop1:

        ## if (iIndex > iExp) goto loopend1;
        movl    -8(%ebp), %eax
        movl    12(%ebp), %ecx
        cmpl    %ecx, %eax
        jg      loopend1

        ## iPower *= iBase;
        movl    -4(%ebp), %eax
        movl    8(%ebp), %ecx
        imull   %ecx
        movl    %eax, -4(%ebp)
   
        ## iIndex++;
        movl    -8(%ebp), %eax
        movl    $1, %ecx
        addl    %ecx, %eax
        movl    %eax, -8(%ebp)

        ## goto loop1;
        jmp     loop1

loopend1:

        ## return iPower;
        movl    -4(%ebp), %eax
        movl    %ebp, %esp
        popl    %ebp
        ret

#----------------------------------------------------------------------
# int main(int argc, char *argv[])
#
# Read a non-negative base and exponent from stdin.  Write base 
# raised to the exponent power to stdout.
#
# Formal parameter offsets:
#   .equ ARGC, 8
#   .equ ARGV, 12
# Local variable offsets:
#   .equ IBASE,   -4
#   .equ IEXP,    -8
#   .equ IPOWER, -12
#----------------------------------------------------------------------

        .globl  main

main:

        pushl   %ebp
        movl    %esp, %ebp

        ## int iBase;
        movl    $0, %eax
        pushl   %eax

        ## int iExp;
        movl    $0, %eax
        pushl   %eax

        ## int iPower;
        movl    $0, %eax
        pushl   %eax

        ## printf("Enter the base:  ");
        movl    $pcPrompt1, %eax
        pushl   %eax
        call    printf
        movl    $4, %eax
        addl    %eax, %esp

        ## scanf("%d", &iBase); 
        movl    %ebp, %eax
        movl    $-4, %ecx
        addl    %ecx, %eax
        pushl   %eax
        movl    $pcScanfFormat, %eax
        pushl   %eax
        call    scanf
        movl    $8, %eax
        addl    %eax, %esp

        ## printf("Enter the exponent:  ");
        movl    $pcPrompt2, %eax
        pushl   %eax
        call    printf
        movl    $4, %eax
        addl    %eax, %esp

        ## scanf("%d", &iExp); 
        movl    %ebp, %eax
        movl    $-8, %ecx
        addl    %ecx, %eax
        pushl   %eax
        movl    $pcScanfFormat, %eax
        pushl   %eax
        call    scanf
        movl    $8, %eax
        addl    %eax, %esp

        ## iPower = power(iBase, iExp);
        movl    -8(%ebp), %eax
        pushl   %eax
        movl    -4(%ebp), %eax
        pushl   %eax
        call    power
        movl    $8, %ecx
        addl    %ecx, %esp
        movl    %eax, -12(%ebp)

        ## printf("%d to the %d power is %d.\n", iBase, iExp, iPower); 
        movl    -12(%ebp), %eax
        pushl   %eax
        movl    -8(%ebp), %eax
        pushl   %eax
        movl    -4(%ebp), %eax
        pushl   %eax
        movl    $pcResult, %eax
        pushl   %eax
        call    printf
        movl    $16, %eax
        addl    %eax, %esp

        ## return 0;
        movl    $0, %eax
        movl    %ebp, %esp
        popl    %ebp
        ret

