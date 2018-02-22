        ## ============================================================
        ## 05testmuldiv.s
        ## ============================================================

        .section ".text"

        imull   %eax
        imull   %ebx
        imull   %ecx
        imull   %edx
        imull   %esi
        imull   %edi
        imull   %ebp
        imull   %esp

        idivl   %eax
        idivl   %ebx
        idivl   %ecx
        idivl   %edx
        idivl   %esi
        idivl   %edi
        idivl   %ebp
        idivl   %esp

