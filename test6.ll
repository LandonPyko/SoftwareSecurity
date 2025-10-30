define i32 @main(i32 %argc) {
entry:
    %n = sub i32 %argc, 1
    %a = add i32 0, 0
    %b = add i32 1, 0
    br label %head
head:
    %n_head = phi i32 [%n, %entry], [%n_loop, %body]
    %a_head = phi i32 [%a, %entry], [%a_loop, %body]
    %b_head = phi i32 [%b, %entry], [%b_loop, %body]
    call i32 @SINK(i32 %b_head)
    %pred = icmp sgt i32 %n_head, 0
    br i1 %pred, label %body, label %exit
body:
    %a_loop = add i32 %b_head, 0
    %b_loop = add i32 %a_head, %b_head @SOURCE()
    %n_loop = sub i32 %n_head, 1
    br label %head
exit:
    ret i32 %a_head
}