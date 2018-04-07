	.text
	.file	"euclid.c"
	.globl	main
	.p2align	4, 0x90
	.type	main,@function
main:                                   # @main
	.cfi_startproc
# BB#0:
	pushq	%rbp
.Ltmp0:
	.cfi_def_cfa_offset 16
.Ltmp1:
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
.Ltmp2:
	.cfi_def_cfa_register %rbp
	subq	$64, %rsp
	movabsq	$.L.str, %rdi
	movl	$0, -4(%rbp)
	movb	$0, %al
	callq	printf
	movabsq	$.L.str.1, %rdi
	leaq	-16(%rbp), %rsi
	movl	%eax, -36(%rbp)         # 4-byte Spill
	movb	$0, %al
	callq	scanf
	movabsq	$.L.str, %rdi
	movl	%eax, -40(%rbp)         # 4-byte Spill
	movb	$0, %al
	callq	printf
	movabsq	$.L.str.1, %rdi
	leaq	-24(%rbp), %rsi
	movl	%eax, -44(%rbp)         # 4-byte Spill
	movb	$0, %al
	callq	scanf
	movq	-16(%rbp), %rdi
	movq	-24(%rbp), %rsi
	movl	%eax, -48(%rbp)         # 4-byte Spill
	callq	gcd
	movabsq	$.L.str.2, %rdi
	movq	%rax, -32(%rbp)
	movq	-32(%rbp), %rsi
	movb	$0, %al
	callq	printf
	xorl	%ecx, %ecx
	movl	%eax, -52(%rbp)         # 4-byte Spill
	movl	%ecx, %eax
	addq	$64, %rsp
	popq	%rbp
	retq
.Lfunc_end0:
	.size	main, .Lfunc_end0-main
	.cfi_endproc

	.p2align	4, 0x90
	.type	gcd,@function
gcd:                                    # @gcd
	.cfi_startproc
# BB#0:
	pushq	%rbp
.Ltmp3:
	.cfi_def_cfa_offset 16
.Ltmp4:
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
.Ltmp5:
	.cfi_def_cfa_register %rbp
	subq	$48, %rsp
	movq	%rdi, -8(%rbp)
	movq	%rsi, -16(%rbp)
	movq	-8(%rbp), %rdi
	callq	labs
	movq	%rax, -32(%rbp)
	movq	-16(%rbp), %rdi
	callq	labs
	movq	%rax, -40(%rbp)
.LBB1_1:                                # =>This Inner Loop Header: Depth=1
	cmpq	$0, -40(%rbp)
	je	.LBB1_3
# BB#2:                                 #   in Loop: Header=BB1_1 Depth=1
	movq	-32(%rbp), %rax
	cqto
	idivq	-40(%rbp)
	movq	%rdx, -24(%rbp)
	movq	-40(%rbp), %rdx
	movq	%rdx, -32(%rbp)
	movq	-24(%rbp), %rdx
	movq	%rdx, -40(%rbp)
	jmp	.LBB1_1
.LBB1_3:
	movq	-32(%rbp), %rax
	addq	$48, %rsp
	popq	%rbp
	retq
.Lfunc_end1:
	.size	gcd, .Lfunc_end1-gcd
	.cfi_endproc

	.type	.L.str,@object          # @.str
	.section	.rodata.str1.1,"aMS",@progbits,1
.L.str:
	.asciz	"Enter an integer: "
	.size	.L.str, 19

	.type	.L.str.1,@object        # @.str.1
.L.str.1:
	.asciz	"%ld"
	.size	.L.str.1, 4

	.type	.L.str.2,@object        # @.str.2
.L.str.2:
	.asciz	"The gcd is %ld\n"
	.size	.L.str.2, 16


	.ident	"Apple LLVM version 8.1.0 (clang-802.0.42)"
	.section	".note.GNU-stack","",@progbits
