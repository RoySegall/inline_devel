            Devel inline - what is it?

devel inline is a module that empersize the execute code form of devel module.

Why use it?
The execute code form is good for debugging data without edit files. The problem
is that we don't have an auto complete for functions and classes.
Inline devel offers you this solution. When starting to type the function name,
you'l get a list of functions, classes, interfaces and hooks available to you.

Yes, you can define hooks. All the hooks you'l write down in the execute code form
will be attached as hooks defined by the module inline_dvel_dummy_module. If you
worried - inline devel is not writing on the files of the modules but create a
session with a stack of the hooks you defnied or any other functions.

If you'd like to delete some functions that you defined in the execute code form
go to admin/config/development/inline_devel_admin and there you can delete the
functions.

Problem for beta:
1.  The regex pattern that detect functions from the form can detect only one
    function at a time. Also if there is a defined function and simple code after
    that - not work as well.

Future ideas:
* All code written in the execute code form - will be saved. Good for when closing
the window without notice.