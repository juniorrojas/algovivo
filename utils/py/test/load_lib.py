from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import algovivo

native_instance = algovivo.NativeInstance.load(
    str(this_dirpath.parent.parent.parent.joinpath("build", "algovivo.so"))
)

assert native_instance.lib.backward_euler_update is not None