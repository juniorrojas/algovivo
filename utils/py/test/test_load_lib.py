from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import algovivo

def test_load_lib():
    native_instance = algovivo.NativeInstance.load(
        os.environ["ALGOVIVO_LIB_FILENAME"]
    )
    assert native_instance.lib.backward_euler_update is not None