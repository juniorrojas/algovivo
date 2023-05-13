from pathlib import Path
import os
this_filepath = Path(os.path.abspath(__file__))
this_dirpath = this_filepath.parent
import configparser
import sys
import shutil
import subprocess

class TextColor:
    green = "\033[92m"
    yellow = "\033[93m"
    end = "\033[0m"

def color_text(color, text):
    return f"{color}{text}{TextColor.end}"

def yellow(text):
    return color_text(TextColor.yellow, text)

def green(text):
    return color_text(TextColor.green, text)

def cleandir(d):
    if os.path.exists(d):
        shutil.rmtree(d)
    os.makedirs(d)

def infer_repo_dirname():
    current_dirpath = Path(os.path.abspath(os.getcwd()))
    while not os.path.exists(current_dirpath.joinpath(".git")):
        if current_dirpath.parent == current_dirpath:
            raise RuntimeError("could not infer repo name")
        current_dirpath = current_dirpath.parent
    return str(current_dirpath)

def infer_remote_url():
    config = configparser.ConfigParser()
    repo_dirname = infer_repo_dirname()
    config.read(os.path.join(repo_dirname, ".git", "config"))
    sections = config.sections()

    # TODO handle case when .git/config contains multiple remote sections
    for section in sections:
        is_remote = "remote" in section
        if is_remote:
            remote_url = config.get(section, "url")
            is_github_remote = "github" in remote_url
            if is_github_remote:
                return remote_url

    return None

def git_clone(remote_url, remote, deploy_path, deploy_branch):
    cleandir(deploy_path)
    print(yellow(f"Cloning git repo {remote_url}"), file=sys.stderr)

    os.chdir(deploy_path)
    e = subprocess.call(["git", "init"])
    if e != 0:
        raise RuntimeError("git init failed")
    e = subprocess.call(["git", "remote", "add", remote, remote_url])
    if e != 0:
        raise RuntimeError("git remote add failed")
    e = subprocess.call(["git", "pull", remote, deploy_branch])
    if e != 0:
        # we assume git pull failed because the branch doesn't exist,
        # this is the case the first time you try to deploy
        e = subprocess.call(["git", "checkout", "-b", deploy_branch])
        if e != 0:
            raise RuntimeError("git checkout failed")
    else:
        e = subprocess.call(["git", "checkout", deploy_branch])
        if e != 0:
            raise RuntimeError("git checkout failed")
        
def git_push_deploy(deploy_path, remote, deploy_branch):
    os.chdir(deploy_path)

    e = subprocess.call(["git", "add", "."])
    if e != 0:
        raise RuntimeError("git add failed")
    e = subprocess.call(["git", "commit", "-m", "Deploy"])
    if e != 0:
        # assume there is nothing new to commit
        return
    e = subprocess.call(["git", "push", remote, deploy_branch])
    if e != 0:
        raise RuntimeError("git push failed")
    
def clean_deploy_dir(deploy_path):
    # remove all existing files in deploy_path (from last deployment), except .git
    for filename in os.listdir(deploy_path):
        if filename == ".git":
            continue
        if os.path.isdir(filename):
            shutil.rmtree(filename)
        else:
            os.remove(filename)
    
def run(remote_url, deploy_path, deploy_branch, push=False, populate_deploy_path=None):
    assert populate_deploy_path is not None
    
    if push:
        remote = "origin"
        git_clone(remote_url, remote, deploy_path, deploy_branch)
    else:
        os.makedirs(deploy_path, exist_ok=True)
        os.chdir(deploy_path)

    clean_deploy_dir(deploy_path)
    
    populate_deploy_path(deploy_path)
    print(yellow(f"Preview available at:\n{deploy_path}"), file=sys.stderr)
    
    if push:
        a = input(f"Deploy to {remote_url}@{deploy_branch}? [y/_] ")
        if a.rstrip().lstrip() != "y":
            return
        git_push_deploy(deploy_path, remote, deploy_branch)