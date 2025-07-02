import os

def is_docker():
    # Check for Docker by environment variable or cgroup
    return os.environ.get('IN_DOCKER') == '1' or (
        os.path.exists('/proc/1/cgroup') and any(word in open('/proc/1/cgroup').read() for word in ['docker', 'containerd'])
    )
