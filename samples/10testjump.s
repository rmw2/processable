        ## ============================================================
        ## 10testjump.s
        ## ============================================================

        .section ".text"

        cmpl    %eax, %eax
        cmpl    %eax, %ebx
        cmpl    %eax, %ecx
        cmpl    %eax, %edx
        cmpl    %eax, %esi
        cmpl    %eax, %edi
        cmpl    %eax, %ebp
        cmpl    %eax, %esp

        cmpl    %eax, %eax
        cmpl    %ebx, %eax
        cmpl    %ecx, %eax
        cmpl    %edx, %eax
        cmpl    %esi, %eax
        cmpl    %edi, %eax
        cmpl    %ebp, %eax
        cmpl    %esp, %eax

        jmp     somelabel
        je      somelabel
        jne     somelabel
        jl      somelabel
        jle     somelabel
        jg      somelabel
        jge     somelabel

