        ## ============================================================
        ## 04testaddsub.s
        ## ============================================================

        .section ".text"

        addl    %eax, %eax
        addl    %eax, %ebx
        addl    %eax, %ecx
        addl    %eax, %edx
        addl    %eax, %esi
        addl    %eax, %edi
        addl    %eax, %ebp
        addl    %eax, %esp

        addl    %eax, %eax
        addl    %ebx, %eax
        addl    %ecx, %eax
        addl    %edx, %eax
        addl    %esi, %eax
        addl    %edi, %eax
        addl    %ebp, %eax
        addl    %esp, %eax

        subl    %eax, %eax
        subl    %eax, %ebx
        subl    %eax, %ecx
        subl    %eax, %edx
        subl    %eax, %esi
        subl    %eax, %edi
        subl    %eax, %ebp
        subl    %eax, %esp

        subl    %eax, %eax
        subl    %ebx, %eax
        subl    %ecx, %eax
        subl    %edx, %eax
        subl    %esi, %eax
        subl    %edi, %eax
        subl    %ebp, %eax
        subl    %esp, %eax

