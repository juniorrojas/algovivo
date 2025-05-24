import algovivo
import shutil
import json
from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent

if __name__ == "__main__":
    native_instance = algovivo.NativeInstance.load(
        str(this_dirpath.parent.parent.parent.parent.joinpath("build", "algovivo.so"))
    )

    system = algovivo.System(native_instance)
    print(system.num_vertices)

    with open(this_dirpath.joinpath("data", "mesh.json"), "r") as f:
        data = json.load(f)

    system.vertices.set(pos=data["pos"])
    system.muscles.set(
        indices=data["muscles"],
        pos=data["pos"],
        l0=data["l0"]
    )
    system.triangles.set(
        indices=data["triangles"],
        pos=data["pos"],
        rsi=data["rsi"]
    )

    seq_dirname = "steps.out"
    shutil.rmtree(seq_dirname, ignore_errors=True)
    os.makedirs(seq_dirname, exist_ok=True)

    for i in range(100):
        print(i)
        system.step()

        filename = os.path.join(seq_dirname, f"{i}.json")
        with open(filename, "w") as f:
            json.dump({
                "pos0": system.vertices.pos.tolist(),
                "a0": system.muscles.a.tolist()
            }, f)