@glbl1 = global i32 2, align 4
@glbl2 = global i32 3, align 4

define i32 @main(i32 %argc) {
        %noArgs = icmp eq i32 %argc, 1
        br i1 %noArgs, label %lbl_t, label %lbl_f
lbl_t:
        %len = call i32 (i8*) @atoi(i8* %elt1)
        %ans = call i32 (i8*) @atoi(i8* %elt1)
        %varT = add i32 1, 0
        %testArgs = icmp eq i32 %argc, 1
        br label %lbl_new
lbl_new:
        ret i32 1
lbl_f:
        %varF = add i32 1, 0
        br label %end
end:
        %var = phi i32 [%varT, %lbl_t], [%varF, %lbl_f]
        ret i32 %var
}

define i32 @func1(i32 %argc) {
entry:
        %noArgs = icmp eq i32 %argc, 1
        br i1 %noArgs, label %lbl_t, label %lbl_f
lbl_t:
        %varT = add i32 1, 0
        br label %end
lbl_f:
        %varF = add i32 2, 0
        br label %end
end:
        %var = phi i32 [%varT, %lbl_t], [%varF, %lbl_f]
        ret i32 %var
}

define i32 @func2(i32 %argc) {
        %num = add i32 1,0
        %ans = add i32 1, %num
        br label %lbl_one
        
lbl_one:
        %len = call i32 (i8*) @atoi(i8* %elt1)
        br label %lbl_t
lbl_t:
        %varT = add i32 1, 0
        %ans2 = call i32 (i8*) @atoi(i8* %elt1)
        br label %end
lbl_f:
        %varF = add i32 2, 0
        br label %end
end:
        %var = phi i32 [%varT, %lbl_t], [%varF, %lbl_f]
        ret i32 %var
}

define i32 @func3(i32 %argc) {
entry:
        %len = call i32 (i8*) @atoi(i8* %elt1)
        br i1 %noArgs, label %lbl_t, label %lbl_f
lbl_t:
        %varT = add i32 1, 0
        br label %end
lbl_f:
        br label %end
end:
        %var = phi i32 [%varT, %lbl_t], [%varF, %lbl_f]
        ret i32 %var
}

declare i32 @atoi(i8*)