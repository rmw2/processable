        ## ============================================================
        ## 06testpushpop.s
        ## ============================================================

        .section ".text"

        pushl   %eax
        pushl   %ebx
        pushl   %ecx
        pushl   %edx
        pushl   %esi
        pushl   %edi
        pushl   %ebp
        pushl   %esp

        popl    %eax
        popl    %ebx
        popl    %ecx
        popl    %edx
        popl    %esi
        popl    %edi
        popl    %ebp
        popl    %esp

